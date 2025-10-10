import { z } from "zod";
import { resumeQueue } from "~/lib/queue";
import {
  createTRPCRouter,
  publicProcedure,
  externalAIProcedure,
} from "~/server/api/trpc";

export const applicantRouter = createTRPCRouter({
  applyJob: publicProcedure
    .input(
      z.object({
        jobId: z.number(),
        name: z.string().min(1, "Name is required").max(255),
        email: z.string().email("Valid email is required").max(255),
        resumeFileName: z.string().min(1, "Resume file name is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First verify the job exists and is open
      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId, isOpen: true },
      });

      if (!job) {
        throw new Error("Job not found or is no longer accepting applications");
      }

      // Check if user has already applied to this job
      const existingApplication = await ctx.db.applicant.findFirst({
        where: {
          jobId: input.jobId,
          email: input.email,
        },
      });

      if (existingApplication) {
        throw new Error("You have already applied to this position");
      }

      // Create the applicant
      const applicant = await ctx.db.applicant.create({
        data: {
          name: input.name,
          email: input.email,
          resume: input.resumeFileName, // Store the MinIO file path/name
          jobId: input.jobId,
          statusAI: "pending",
          interviewStatus: "pending",
          skillsScoreAI: 0.0,
          experienceScoreAI: 0.0,
          educationScoreAI: 0.0,
          timezoneScoreAI: 0.0,
          overallScoreAI: 0.0,
        },
      });

      await resumeQueue.add("process-resume", {
        applicantId: applicant.id,
        resumePath: input.resumeFileName,
      });

      return { success: true, id: applicant.id };
    }),

  updateStatusAI: externalAIProcedure
    .input(
      z.object({
        applicantId: z.number(),
        statusAI: z.enum([
          "pending",
          "parsing",
          "processing",
          "completed",
          "failed",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const applicant = await ctx.db.applicant.update({
        where: { id: input.applicantId },
        data: { statusAI: input.statusAI },
      });

      if (!applicant) {
        throw new Error("Applicant not found");
      }

      return { success: true };
    }),

  reQueueResumeProcessing: externalAIProcedure
    .input(
      z.object({
        applicantId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const applicant = await ctx.db.applicant.findUnique({
        where: { id: input.applicantId },
      });

      if (!applicant) {
        throw new Error("Applicant not found");
      }

      if (!applicant.resume) {
        throw new Error("Applicant does not have a resume on file");
      }

      // Re-add to the queue
      await resumeQueue.add("process-resume", {
        applicantId: applicant.id,
        resumePath: applicant.resume,
      });

      // Update statusAI to 'pending' if it was 'failed'
      await ctx.db.applicant.update({
        where: { id: applicant.id },
        data: { statusAI: "pending" },
      });

      return { success: true };
    }),

  updateParsedDataAI: externalAIProcedure
    .input(
      z.object({
        applicantId: z.number(),
        parsedHighestEducationDegree: z.string().max(100).optional(),
        parsedEducationField: z.string().max(100).optional(),
        parsedTimezone: z.string().max(100).optional(),
        parsedSkills: z.string().optional(), // Comma-separated list
        parsedYearsOfExperience: z.number().min(0).optional(),
        parsedExperiences: z
          .array(
            z.object({
              jobTitle: z.string().max(255),
              startYear: z.string(),
              endYear: z.string().optional(),
              startMonth: z.string(),
              endMonth: z.string().optional(),
              isRelevant: z.boolean().optional(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Use a transaction to update applicant and create experiences atomically
      await ctx.db.$transaction(async (tx) => {
        // Update applicant with parsed data
        const applicant = await tx.applicant.update({
          where: { id: input.applicantId },
          data: {
            parsedHighestEducationDegree: input.parsedHighestEducationDegree,
            parsedEducationField: input.parsedEducationField,
            parsedTimezone: input.parsedTimezone,
            parsedSkills: input.parsedSkills,
            parsedYearsOfExperience: input.parsedYearsOfExperience,
          },
        });

        if (!applicant) {
          throw new Error("Applicant not found");
        }

        // If experiences are provided, delete old ones and create new ones
        if (input.parsedExperiences && input.parsedExperiences.length > 0) {
          // Delete existing experiences for this applicant
          await tx.experience.deleteMany({
            where: { applicantId: input.applicantId },
          });

          // Create new experiences
          await tx.experience.createMany({
            data: input.parsedExperiences.map((exp) => ({
              applicantId: input.applicantId,
              jobTitle: exp.jobTitle,
              startYear: exp.startYear,
              endYear: exp.endYear ?? null,
              startMonth: exp.startMonth,
              endMonth: exp.endMonth ?? null,
              isRelevant: exp.isRelevant ?? false,
            })),
          });
        }
      });

      return { success: true };
    }),

  updateApplicantMatchedSkillsAI: externalAIProcedure
    .input(
      z.object({
        applicantId: z.number(),
        matchedSkills: z.array(
          z.object({
            jobSkill: z.string().max(100),
            matchType: z.enum(["explicit", "implied", "missing"]),
            applicantSkill: z.string().max(100),
            score: z.number().min(0).max(100),
            reason: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify applicant exists
      const applicant = await ctx.db.applicant.findUnique({
        where: { id: input.applicantId },
      });

      if (!applicant) {
        throw new Error("Applicant not found");
      }

      // Use a transaction to delete old matched skills and create new ones
      await ctx.db.$transaction(async (tx) => {
        // Delete existing matched skills for this applicant
        await tx.matchedSkill.deleteMany({
          where: { applicantId: input.applicantId },
        });

        // Create new matched skills if provided
        if (input.matchedSkills.length > 0) {
          await tx.matchedSkill.createMany({
            data: input.matchedSkills.map((skill) => ({
              applicantId: input.applicantId,
              jobSkill: skill.jobSkill,
              matchType: skill.matchType,
              applicantSkill: skill.applicantSkill,
              score: skill.score,
              reason: skill.reason ?? null,
            })),
          });
        }
      });

      return { success: true };
    }),

  queueScoring: externalAIProcedure
    .input(
      z.object({
        applicantId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const applicant = await ctx.db.applicant.findUnique({
        where: { id: input.applicantId },
        include: { experiences: true },
      });

      if (!applicant) {
        throw new Error("Applicant not found");
      }

      if (applicant.statusAI !== "processing") {
        throw new Error("Applicant resume processing is not completed");
      }

      const job = await ctx.db.job.findUnique({
        where: { id: applicant.jobId },
      });

      console.log(applicant);

      await resumeQueue.add("score-applicant", {
        applicantId: applicant.id,
        applicantData: JSON.stringify(applicant),
        jobData: JSON.stringify(job),
      });

      return { success: true };
    }),
});

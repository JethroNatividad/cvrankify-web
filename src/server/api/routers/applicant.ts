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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const applicant = await ctx.db.applicant.update({
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

      return { success: true };
    }),
});

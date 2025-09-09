import { z } from "zod";
import { resumeQueue } from "~/lib/queue";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
});

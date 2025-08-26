import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const applicantRouter = createTRPCRouter({
  applyJob: publicProcedure
    .input(
      z.object({
        jobId: z.number(),
        name: z.string().min(1, "Name is required").max(255),
        email: z.string().email("Valid email is required").max(255),
        resume: z.string().min(1, "Resume content is required"),
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
          resume: input.resume,
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

      return { success: true, id: applicant.id };
    }),
});

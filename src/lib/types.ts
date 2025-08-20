import type { Job } from "@prisma/client";

// Custom type that converts Decimal fields to strings for client components
export type JobWithStringWeights = Omit<
  Job,
  "skillsWeight" | "experienceWeight" | "educationWeight" | "timezoneWeight"
> & {
  skillsWeight: string;
  experienceWeight: string;
  educationWeight: string;
  timezoneWeight: string;
};

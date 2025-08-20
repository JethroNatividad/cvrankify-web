import type { Applicant, User, Prisma } from "@prisma/client";

export type SerializedApplicant = Omit<
  Applicant,
  | "skillsScoreAI"
  | "experienceScoreAI"
  | "educationScoreAI"
  | "timezoneScoreAI"
  | "overallScoreAI"
> & {
  skillsScoreAI: string;
  experienceScoreAI: string;
  educationScoreAI: string;
  timezoneScoreAI: string;
  overallScoreAI: string;
};

export type Job = Prisma.JobGetPayload<{
  include: {
    createdBy: {
      select: {
        name: true;
        email: true;
      };
    };
  };
}>;

export type JobWithIncludes = Job & {
  applicants: SerializedApplicant[];
};

export type SerializedJob = Omit<
  JobWithIncludes,
  "skillsWeight" | "experienceWeight" | "educationWeight" | "timezoneWeight"
> & {
  skillsWeight: string;
  experienceWeight: string;
  educationWeight: string;
  timezoneWeight: string;
};

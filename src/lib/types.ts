import type { Applicant, Prisma } from "@prisma/client";

export type SerializedApplicant = Omit<
  Applicant,
  | "skillsScoreAI"
  | "experienceScoreAI"
  | "educationScoreAI"
  | "timezoneScoreAI"
  | "overallScoreAI"
  | "parsedYearsOfExperience"
> & {
  skillsScoreAI: string;
  experienceScoreAI: string;
  educationScoreAI: string;
  timezoneScoreAI: string;
  overallScoreAI: string;
  parsedYearsOfExperience?: string;
};

export type ApplicantWithIncludes = Prisma.ApplicantGetPayload<{
  include: {
    experiences: true;
    matchedSkills: true;
  };
}>;

export type SerializedMatchedSkill = Omit<
  Prisma.MatchedSkillGetPayload<Record<string, never>>,
  "score"
> & {
  score: string;
};

export type SerializedApplicantWithIncludes = Omit<
  ApplicantWithIncludes,
  | "skillsScoreAI"
  | "experienceScoreAI"
  | "educationScoreAI"
  | "timezoneScoreAI"
  | "overallScoreAI"
  | "matchedSkills"
  | "parsedYearsOfExperience"
> & {
  skillsScoreAI: string;
  experienceScoreAI: string;
  educationScoreAI: string;
  timezoneScoreAI: string;
  overallScoreAI: string;
  parsedYearsOfExperience?: string;
  matchedSkills: SerializedMatchedSkill[];
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
  applicants: ApplicantWithIncludes[];
};

export type SerializedJob = Omit<
  JobWithIncludes,
  | "skillsWeight"
  | "experienceWeight"
  | "educationWeight"
  | "timezoneWeight"
  | "applicants"
> & {
  skillsWeight: string;
  experienceWeight: string;
  educationWeight: string;
  timezoneWeight: string;
  applicants: SerializedApplicantWithIncludes[];
};

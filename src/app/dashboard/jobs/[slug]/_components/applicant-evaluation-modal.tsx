"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "~/app/_components/ui/dialog";
import { cn } from "~/lib/utils";
import type {
  SerializedApplicantWithIncludes,
  SerializedJob,
} from "~/lib/types";

// const job = {
//   title: "Frontend Developer",
//   skills: "React, TypeScript, JavaScript, HTML, CSS",
//   yearsOfExperience: 3,
//   educationDegree: "Bachelor",
//   educationField: "Computer Science",
//   timezone: "GMT-5",
// };

// const applicant = {
//   name: "Angelo",
//   email: "angelo@email.com",
//   parsedSkills: "HTML/CSS, Photoshop, Illustrator, Branding",
//   parsedHighestEducationDegree: "Bachelor",
//   parsedEducationField: "Graphic Design",
//   parsedTimezone: "GMT+8",
//   matchedSkills: [
//     {
//       jobSkill: "React",
//       matchType: "missing",
//       applicantSkill: "",
//       score: 0.0,
//       reason: "No related or similar skill found in CV",
//     },
//     {
//       jobSkill: "TypeScript",
//       matchType: "missing",
//       applicantSkill: "",
//       score: 0.0,
//       reason: "No related or similar skill found in CV",
//     },
//     {
//       jobSkill: "JavaScript",
//       matchType: "implied",
//       applicantSkill: "HTML/CSS",
//       score: 0.7,
//       reason: "Inferred from related web technology",
//     },
//     {
//       jobSkill: "HTML",
//       matchType: "explicit",
//       applicantSkill: "HTML/CSS",
//       score: 1.0,
//       reason: "Exact match between job skill and CV skill",
//     },
//     {
//       jobSkill: "CSS",
//       matchType: "explicit",
//       applicantSkill: "HTML/CSS",
//       score: 1.0,
//       reason: "Exact match between job skill and CV skill",
//     },
//   ],
//   experiences: [
//     {
//       id: 1,
//       jobTitle: "Graphic Artist",
//       startMonth: "April",
//       startYear: "2011",
//       endMonth: "None",
//       endYear: "Present",
//       relevant: true,
//     },
//     {
//       id: 2,
//       jobTitle: "Freelance Designer",
//       startMonth: "June",
//       startYear: "2009",
//       endMonth: "March",
//       endYear: "2011",
//       relevant: false,
//     },
//   ],
//   educationScoreAI: 94.0,
//   experienceScoreAI: 205.0,
//   skillsScoreAI: 22.73,
//   timezoneScoreAI: 25.0,
//   overallScoreAI: 91.89,
//   totalYearsOfExperience: 13.5,
// };

type Props = {
  job: SerializedJob;
  applicant: SerializedApplicantWithIncludes;
  children: React.ReactNode;
};

export default function ApplicantEvaluationModal({
  job,
  applicant,
  children,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{applicant.email}</DialogTitle>
          <DialogDescription>
            Detailed evaluation and scoring of applicant against job
            requirements
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* 📊 Job vs Applicant Comparison */}
          <section>
            <h3 className="text-muted-foreground mb-2 text-sm font-semibold uppercase">
              Job Requirements vs Applicant
            </h3>
            <div className="bg-muted/30 overflow-hidden rounded-md border">
              <div className="bg-border grid grid-cols-3 gap-px">
                {/* Header */}
                <div className="bg-muted/30 p-2">
                  <span className="text-muted-foreground text-xs font-semibold">
                    Criteria
                  </span>
                </div>
                <div className="bg-muted/30 p-2">
                  <span className="text-muted-foreground text-xs font-semibold">
                    Job Requirement
                  </span>
                </div>
                <div className="bg-muted/30 p-2">
                  <span className="text-muted-foreground text-xs font-semibold">
                    Applicant
                  </span>
                </div>

                {/* Education */}
                <div className="bg-background p-2">
                  <span className="text-sm font-medium">Education</span>
                </div>
                <div className="bg-background p-2">
                  <span className="text-sm">
                    {job.educationDegree}
                    {job.educationField && ` in ${job.educationField}`}
                  </span>
                </div>
                <div className="bg-background p-2">
                  <span className="text-sm">
                    {applicant.parsedHighestEducationDegree} in{" "}
                    {applicant.parsedEducationField}
                  </span>
                </div>

                {/* Experience */}
                <div className="bg-background p-2">
                  <span className="text-sm font-medium">Experience</span>
                </div>
                <div className="bg-background p-2">
                  <span className="text-sm">{job.yearsOfExperience} years</span>
                </div>
                <div className="bg-background p-2">
                  <span
                    className={cn(
                      "text-sm",
                      applicant.parsedYearsOfExperience !== null &&
                        Number(applicant.parsedYearsOfExperience) >=
                          job.yearsOfExperience
                        ? "font-medium text-green-600"
                        : "text-red-600",
                    )}
                  >
                    {Number(applicant.parsedYearsOfExperience ?? 0)} years
                  </span>
                </div>

                {/* Skills */}
                <div className="bg-background p-2">
                  <span className="text-sm font-medium">Skills</span>
                </div>
                <div className="bg-background p-2">
                  <span className="text-muted-foreground text-xs">
                    {job.skills}
                  </span>
                </div>
                <div className="bg-background p-2">
                  <span className="text-muted-foreground text-xs">
                    {applicant.parsedSkills}
                  </span>
                </div>

                {/* Timezone */}
                <div className="bg-background p-2">
                  <span className="text-sm font-medium">Timezone</span>
                </div>
                <div className="bg-background p-2">
                  <span className="text-sm">{job.timezone}</span>
                </div>
                <div className="bg-background p-2">
                  <span className="text-sm">{applicant.parsedTimezone}</span>
                </div>
              </div>
            </div>
          </section>

          {/* 🧩 Skills Match */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-muted-foreground text-sm font-semibold uppercase">
                Skills Match
              </h3>
              <span className="text-primary text-sm font-semibold">
                {applicant.skillsScoreAI.toString()} pts
              </span>
            </div>
            <div className="bg-muted/30 space-y-2 rounded-md border p-3 text-sm">
              {applicant.matchedSkills.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 border-b pb-2 last:border-none last:pb-0"
                >
                  <div className="flex-1">
                    <div className="font-medium">{s.jobSkill}</div>
                    <div className="text-muted-foreground text-xs">
                      {s.reason}
                      {s.matchType === "implied" && s.applicantSkill && (
                        <span className="ml-1 text-blue-600">
                          (implied from {s.applicantSkill})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs font-medium">
                      {(Number(s.score) * 100).toFixed(0)}%
                    </span>
                    <div
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium",
                        s.matchType === "explicit"
                          ? "bg-green-100 text-green-700"
                          : s.matchType === "implied"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700",
                      )}
                    >
                      {s.matchType.charAt(0).toUpperCase() +
                        s.matchType.slice(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 💼 Experiences */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-muted-foreground text-sm font-semibold uppercase">
                Experiences
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-xs">
                  Total: {Number(applicant.parsedYearsOfExperience ?? 0)} years
                </span>
                <span className="text-primary text-sm font-semibold">
                  {applicant.experienceScoreAI.toString()} pts
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {applicant.experiences.length > 0 ? (
                applicant.experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className={cn(
                      "bg-muted/30 flex items-center justify-between rounded-md border p-3 text-sm",
                      exp.relevant ? "border-l-4 border-l-green-500" : "",
                    )}
                  >
                    <div>
                      <div className="font-medium">{exp.jobTitle}</div>
                      <div className="text-muted-foreground text-xs">
                        {exp.startMonth} {exp.startYear} –{" "}
                        {exp.endMonth !== "None" ? exp.endMonth : "Present"}{" "}
                        {exp.endYear !== "Present" ? exp.endYear : ""}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium",
                        exp.relevant
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {exp.relevant ? "Relevant" : "Not Relevant"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No experiences found.
                </p>
              )}
            </div>
          </section>

          {/* 🎓 Education */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-muted-foreground text-sm font-semibold uppercase">
                Education Match
              </h3>
              <span className="text-primary text-sm font-semibold">
                {applicant.educationScoreAI.toString()} pts
              </span>
            </div>
            <div className="bg-muted/30 flex justify-between rounded-md border p-3 text-sm">
              <span>
                {applicant.parsedHighestEducationDegree} in{" "}
                {applicant.parsedEducationField}
              </span>
            </div>
          </section>

          {/* 🌐 Timezone */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-muted-foreground text-sm font-semibold uppercase">
                Timezone Compatibility
              </h3>
              <span className="text-primary text-sm font-semibold">
                {applicant.timezoneScoreAI.toString()} pts
              </span>
            </div>
            <div className="bg-muted/30 flex justify-between rounded-md border p-3 text-sm">
              <span>{applicant.parsedTimezone}</span>
            </div>
          </section>

          {/* 🧮 Overall */}
          <section>
            <div className="border-t pt-4">
              <div className="bg-primary/5 border-primary/20 flex items-center justify-between rounded-lg border-2 p-4">
                <h3 className="text-base font-semibold">Overall AI Score</h3>
                <span className="text-primary text-2xl font-bold">
                  {applicant.overallScoreAI.toString()}
                </span>
              </div>
              <div className="text-muted-foreground mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>Skills:</span>
                  <span>{applicant.skillsScoreAI.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Experience:</span>
                  <span>{applicant.experienceScoreAI.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Education:</span>
                  <span>{applicant.educationScoreAI.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Timezone:</span>
                  <span>{applicant.timezoneScoreAI.toString()}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

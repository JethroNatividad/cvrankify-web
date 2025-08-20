"use client";

import React from "react";
import { Badge } from "~/app/_components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/app/_components/ui/table";
import type { SerializedJob } from "~/lib/types";

interface ApplicantsTableProps {
  job: SerializedJob;
}

const formatTimeAgo = (date: Date | string): string => {
  try {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) {
      return "Unknown";
    }
    const now = new Date();
    const diffInMs = now.getTime() - parsedDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "1 day ago";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? "1 month ago" : `${months} months ago`;
    }
  } catch {
    return "Unknown";
  }
};

export function ApplicantsTable({ job: { applicants } }: ApplicantsTableProps) {
  if (!applicants?.length) {
    return (
      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-base font-medium">Applicants</h2>
            <p className="text-muted-foreground text-sm">No applications yet</p>
          </div>
        </div>
        <div className="text-muted-foreground p-6 text-center text-sm">
          <div className="space-y-2">
            <div className="text-foreground text-lg font-medium">
              No Applicants Yet
            </div>
            <p>Applications will appear here when candidates apply</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "scheduled":
        return "secondary";
      case "passed":
        return "default";
      case "failed":
        return "destructive";
      case "hired":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getAIStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white dark:bg-green-600";
      case "processing":
        return "bg-yellow-500 text-white dark:bg-yellow-600";
      case "pending":
        return "bg-gray-500 text-white dark:bg-gray-600";
      case "failed":
        return "bg-red-500 text-white dark:bg-red-600";
      default:
        return "outline";
    }
  };

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h2 className="text-base font-medium">Applicants</h2>
          <p className="text-muted-foreground text-sm">
            {applicants.length} total application
            {applicants.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {applicants.length} Applied
          </Badge>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Applicant</TableHead>
              <TableHead className="w-[120px]">Overall Score</TableHead>
              <TableHead className="w-[100px]">AI Status</TableHead>
              <TableHead className="w-[120px]">Interview Status</TableHead>
              <TableHead className="w-[100px]">Applied</TableHead>
              <TableHead className="w-[300px]">Assessment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applicants.map((applicant) => {
              const overallScore = parseFloat(applicant.overallScoreAI);
              const skillsScore = parseFloat(applicant.skillsScoreAI);
              const experienceScore = parseFloat(applicant.experienceScoreAI);
              const educationScore = parseFloat(applicant.educationScoreAI);
              const timezoneScore = parseFloat(applicant.timezoneScoreAI);

              return (
                <TableRow key={applicant.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{applicant.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {applicant.email}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {applicant.statusAI === "completed" ? (
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {(overallScore * 100).toFixed(0)}%
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Overall
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-center text-sm">
                        Pending
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getAIStatusColor(applicant.statusAI)}`}
                    >
                      {applicant.statusAI}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={getStatusColor(applicant.interviewStatus)}
                      className="text-xs"
                    >
                      {applicant.interviewStatus}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="text-muted-foreground text-sm">
                      {formatTimeAgo(applicant.createdAt)}
                    </div>
                  </TableCell>

                  <TableCell>
                    {applicant.statusAI === "completed" ? (
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center">
                          <div className="text-sm font-medium text-blue-600">
                            {(skillsScore * 100).toFixed(0)}%
                          </div>
                          <div className="text-muted-foreground text-xs">
                            Skills
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-green-600">
                            {(experienceScore * 100).toFixed(0)}%
                          </div>
                          <div className="text-muted-foreground text-xs">
                            Exp
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-purple-600">
                            {(educationScore * 100).toFixed(0)}%
                          </div>
                          <div className="text-muted-foreground text-xs">
                            Edu
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-orange-600">
                            {(timezoneScore * 100).toFixed(0)}%
                          </div>
                          <div className="text-muted-foreground text-xs">
                            Time
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-center text-sm">
                        Processing...
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

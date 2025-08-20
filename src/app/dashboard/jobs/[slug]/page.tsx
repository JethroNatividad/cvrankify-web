import React from "react";
import { api } from "~/trpc/server";
import { Badge } from "~/app/_components/ui/badge";
import { Button } from "~/app/_components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/app/_components/ui/collapsible";
import {
  CalendarDays,
  ChevronDown,
  Clock,
  GraduationCap,
  MapPin,
  Users,
  Edit,
  Briefcase,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface JobPageProps {
  params: Promise<{ slug: string }>;
}

const JobPage = async ({ params }: JobPageProps) => {
  const { slug } = await params;
  const jobId = parseInt(slug);

  if (isNaN(jobId)) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Job Details</h1>
            <p className="text-muted-foreground mt-2">
              View and manage your job posting
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <div className="py-8 text-center">
              <p className="text-red-500">Invalid job ID provided</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const job = await api.job.getById({ id: jobId });

  if (!job) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Job Details</h1>
            <p className="text-muted-foreground mt-2">
              View and manage your job posting
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <div className="py-8 text-center">
              <p className="text-red-500">Job not found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const skills = job.skills.split(", ").filter(Boolean);
  const applicationCount = job.applicants?.length || 0;

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <Badge variant={job.isOpen ? "default" : "secondary"}>
                {job.isOpen ? "Open" : "Closed"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {applicationCount} applications • Updated{" "}
              {new Date(job.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <Button asChild>
            <Link href={`/dashboard/jobs/${jobId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>

        {/* Job Details - Compact Collapsible */}
        <Collapsible defaultOpen>
          <div className="rounded-lg border">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className="hover:bg-muted/50 flex w-full justify-between p-4 text-left text-base font-medium"
              >
                Job Details
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pt-2 pb-4">
              <div className="space-y-4 text-sm">
                {/* Quick Stats */}
                <div className="text-muted-foreground flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {job.yearsOfExperience}y exp
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {job.educationDegree}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.timezone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {job.hires}/{job.hiresNeeded} hired
                  </span>
                </div>

                {/* Skills */}
                <div>
                  <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 6).map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-2 py-0.5 text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {skills.length > 6 && (
                      <Badge variant="outline" className="px-2 py-0.5 text-xs">
                        +{skills.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Weights - Compact */}
                <div className="text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Weights:</span>
                  <span className="text-blue-600">
                    {Number(Number(job.skillsWeight) * 100).toFixed(0)}% skills
                  </span>
                  <span className="text-green-600">
                    {Number(Number(job.experienceWeight) * 100).toFixed(0)}% exp
                  </span>
                  <span className="text-purple-600">
                    {Number(Number(job.educationWeight) * 100).toFixed(0)}% edu
                  </span>
                  <span className="text-orange-600">
                    {Number(Number(job.timezoneWeight) * 100).toFixed(0)}% tz
                  </span>
                </div>

                <div className="pt-2">
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                    {job.description}
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <div className="rounded-lg border">
          <div className="flex items-center justify-between border-b p-3">
            <h2 className="font-medium">Applicants</h2>
            <Badge variant="outline" className="text-xs">
              {applicationCount}
            </Badge>
          </div>
          <div className="text-muted-foreground p-6 text-center text-sm">
            applicants table (dont touch for now)
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPage;

import React from "react";

interface JobPageProps {
  params: Promise<{ slug: string }>;
}

const JobPage = async ({ params }: JobPageProps) => {
  const { slug } = await params;
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Job</h1>
          <p className="text-muted-foreground mt-2">
            Update your job posting details and requirements
          </p>
        </div>

        <div className="rounded-lg border p-6">collapsible job details</div>
        <div className="rounded-lg border p-6">applicants table</div>
      </div>
    </div>
  );
};

export default JobPage;

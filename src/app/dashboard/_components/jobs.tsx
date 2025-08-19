import Link from "next/link";
import React from "react";
import { Button } from "~/app/_components/ui/button";

const Jobs = () => {
  return (
    <div className="container mx-auto py-8">
      <h2 className="mb-2 text-3xl font-bold">Jobs</h2>
      <p className="mb-4 text-gray-600">Here you can manage your jobs.</p>

      <Button variant="outline" asChild>
        <Link href="/dashboard/jobs/create">Create Job</Link>
      </Button>
      {/* Add job management components here */}
    </div>
  );
};

export default Jobs;

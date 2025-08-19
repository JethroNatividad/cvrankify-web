import React from "react";
import Jobs from "./_components/jobs";
import { HydrateClient } from "~/trpc/server";

const Dashboard = async () => {
  return (
    <HydrateClient>
      <div className="container mx-auto">
        <Jobs />
      </div>
    </HydrateClient>
  );
};

export default Dashboard;

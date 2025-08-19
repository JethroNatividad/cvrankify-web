import React from "react";
import { auth } from "~/server/auth";
import Jobs from "./_components/jobs";

const Dashboard = async () => {
  const session = await auth();

  const user = session!.user;

  return (
    <div className="container mx-auto p-6">
      <Jobs />
    </div>
  );
};

export default Dashboard;

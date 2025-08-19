import React from "react";
import { auth, signOut } from "~/server/auth";

const Dashboard = async () => {
  const session = await auth();

  const user = session!.user;

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Welcome back!</h2>

        <div className="space-y-2">
          {JSON.stringify(session)}
          <p>
            <span className="font-medium">User ID:</span> {user.id}
          </p>
          <p>
            <span className="font-medium">Name:</span>{" "}
            {user.name ?? "Not provided"}
          </p>
          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>
        </div>

        <div className="mt-6">
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button
              type="submit"
              className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

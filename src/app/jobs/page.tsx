import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { Button } from "../_components/ui/button";
import PublicJobs from "./_components/public-jobs";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <div className="container mx-auto">
        <PublicJobs />
      </div>
    </HydrateClient>
  );
}

import { HydrateClient } from "~/trpc/server";
import PublicJobs from "./_components/public-jobs";

export default async function Home() {
  return (
    <HydrateClient>
      <div className="container mx-auto">
        <PublicJobs />
      </div>
    </HydrateClient>
  );
}

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import Navbar from "../_components/navbar";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div>
      <Navbar user={session.user} />
      <main>{children}</main>
    </div>
  );
}

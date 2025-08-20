import Navbar from "../_components/navbar";

export default async function JobsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

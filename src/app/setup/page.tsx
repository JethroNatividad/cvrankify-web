export default function SetupPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to CVRankify</h1>
          <p className="text-muted-foreground mt-2">
            Let&apos;s get your application set up
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Setup Required</h2>
          <p className="text-muted-foreground text-sm">
            No users found in the system. Please complete the initial setup to
            continue.
          </p>

          {/* Add your setup form here */}
          <div className="bg-muted mt-4 rounded p-4">
            <p className="text-sm">Setup form will be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

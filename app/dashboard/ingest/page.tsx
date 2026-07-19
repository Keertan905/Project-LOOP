import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/permissions";
import IngestionWizard from "@/components/IngestionWizard";

export default async function IngestPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // Double check write:feedback permission for ingestion page
  if (!hasPermission(session.user.role, "write:feedback")) {
    redirect("/403");
  }

  return (
    <main className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Ingest Feedback
        </h1>
        <p className="text-slate-400 text-sm">
          Import new customer reviews, NPS comments, or support tickets.
        </p>
      </div>

      <IngestionWizard />
    </main>
  );
}

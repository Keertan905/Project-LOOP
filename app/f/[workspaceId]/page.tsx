import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PublicFeedbackForm from "@/app/f/[workspaceId]/PublicFeedbackForm";

interface PublicFeedbackPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function PublicFeedbackPage({ params }: PublicFeedbackPageProps) {
  const { workspaceId } = await params;

  // Verify workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true },
  });

  if (!workspace) {
    notFound();
  }

  return (
    <PublicFeedbackForm 
      workspaceId={workspace.id} 
      workspaceName={workspace.name} 
    />
  );
}

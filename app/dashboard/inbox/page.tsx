import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FeedbackInboxList from "@/components/FeedbackInboxList";
import { Sentiment, FeedbackStatus, Priority, Prisma } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    channel?: string;
    sentiment?: string;
    status?: string;
    themeId?: string;
    priority?: string;
  }>;
}

export default async function InboxPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const limit = parseInt(resolvedParams.limit || "10", 10);
  const skip = (page - 1) * limit;

  const search = resolvedParams.search || "";
  const channel = resolvedParams.channel || "";
  const sentiment = resolvedParams.sentiment || "";
  const status = resolvedParams.status || "";
  const themeId = resolvedParams.themeId || "";
  const priority = resolvedParams.priority || "";

  // Build DB queries scoped by Workspace
  const workspaceId = session.user.workspaceId;
  const where: Prisma.FeedbackWhereInput = {
    workspaceId,
  };

  if (search) {
    where.content = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (channel) {
    where.channel = channel;
  }

  if (sentiment) {
    where.sentiment = sentiment as Sentiment;
  }

  if (status) {
    where.status = status as FeedbackStatus;
  }

  if (priority) {
    where.priority = priority as Priority;
  }

  if (themeId) {
    where.feedbackThemes = {
      some: {
        themeId: themeId,
      },
    };
  }

  // Execute database operations
  const [total, items, themes, channelsGroup] = await Promise.all([
    prisma.feedback.count({ where }),
    prisma.feedback.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        feedbackThemes: {
          select: {
            confidence: true,
            theme: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    }),
    prisma.theme.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.feedback.groupBy({
      by: ["channel"],
      where: { workspaceId },
    }),
  ]);

  const channels = channelsGroup.map((c) => c.channel);

  // Map database dates to ISO strings for client compatibility
  const serializedItems = items.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <main className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Feedback Inbox
        </h1>
        <p className="text-text-secondary text-sm">
          Browse, filter, and triage customer feedback items.
        </p>
      </div>

      {/* Interactive List */}
      <FeedbackInboxList
        key={`${page}-${limit}-${search}-${channel}-${sentiment}-${status}-${themeId}-${priority}`}
        initialItems={serializedItems}
        pagination={{
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }}
        channels={channels}
        themes={themes}
        currentRole={session.user.role}
      />
    </main>
  );
}

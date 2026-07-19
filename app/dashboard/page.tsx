import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardCharts from "@/components/DashboardCharts";
import { Sentiment, Prisma } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{
    channel?: string;
    sentiment?: string;
    themeId?: string;
    dateRange?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const channel = resolvedParams.channel || "";
  const sentiment = resolvedParams.sentiment || "";
  const themeId = resolvedParams.themeId || "";
  const dateRange = resolvedParams.dateRange || "30d";

  // Build DB filters
  const workspaceId = session.user.workspaceId;
  const where: Prisma.FeedbackWhereInput = {
    workspaceId,
  };

  if (channel) {
    where.channel = channel;
  }

  if (sentiment) {
    where.sentiment = sentiment as Sentiment;
  }

  if (themeId) {
    where.feedbackThemes = {
      some: {
        themeId: themeId,
      },
    };
  }

  // Calculate Date Threshold
  const dateLimit = new Date();
  if (dateRange === "7d") {
    dateLimit.setDate(dateLimit.getDate() - 7);
    where.createdAt = { gte: dateLimit };
  } else if (dateRange === "90d") {
    dateLimit.setDate(dateLimit.getDate() - 90);
    where.createdAt = { gte: dateLimit };
  } else if (dateRange === "all") {
    // No date filter
  } else {
    // Default to 30d
    dateLimit.setDate(dateLimit.getDate() - 30);
    where.createdAt = { gte: dateLimit };
  }

  // Weekly date threshold computed purely
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Execute database aggregation queries in parallel
  const [
    totalCount,
    negativeCount,
    newThisWeek,
    sentimentGroup,
    feedbackItems,
    themes,
    channelsList,
    channelDistributionGroup,
  ] = await Promise.all([
    // Total count for current filters
    prisma.feedback.count({ where }),

    // Negative count for current filters
    prisma.feedback.count({
      where: {
        ...where,
        sentiment: Sentiment.NEG,
      },
    }),

    // New feedback created this week (workspace scoped, ignoring filters)
    prisma.feedback.count({
      where: {
        workspaceId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    }),

    // Sentiment breakdown counts
    prisma.feedback.groupBy({
      by: ["sentiment"],
      where,
      _count: {
        _all: true,
      },
    }),

    // All matching feedbacks for volume over time calculations
    prisma.feedback.findMany({
      where,
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    // Workspace themes list
    prisma.theme.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
      },
    }),

    // Workspace unique channels list for filtering
    prisma.feedback.groupBy({
      by: ["channel"],
      where: { workspaceId },
    }),

    // Channel distribution counts for matching filters
    prisma.feedback.groupBy({
      by: ["channel"],
      where,
      _count: {
        _all: true,
      },
    }),
  ]);

  // Formulate sentiment breakdown for chart
  const sentimentMap = sentimentGroup.reduce((acc, curr) => {
    acc[curr.sentiment] = curr._count._all;
    return acc;
  }, {} as Record<string, number>);

  const sentimentData = [
    { name: "Positive", value: sentimentMap[Sentiment.POS] || 0, color: "#22c55e" },
    { name: "Neutral", value: sentimentMap[Sentiment.NEU] || 0, color: "#f59e0b" },
    { name: "Negative", value: sentimentMap[Sentiment.NEG] || 0, color: "#ef4444" },
  ];

  // Calculate Negative Ratio
  const negativePercent = totalCount > 0 ? Math.round((negativeCount / totalCount) * 100) : 0;

  // Formulate volume over time: group by date (YYYY-MM-DD)
  const volumeMap = feedbackItems.reduce((acc, item) => {
    const dateStr = item.createdAt.toISOString().split("T")[0];
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const volumeOverTime = Object.entries(volumeMap).map(([date, count]) => ({
    date,
    count,
  }));

  // Fetch top themes count (respecting active filters)
  // Join themes and filter matching feedback themes
  const themeCountsRaw = await prisma.theme.findMany({
    where: { workspaceId },
    select: {
      name: true,
      feedbackThemes: {
        where: {
          feedback: where,
        },
        select: {
          feedbackId: true,
        },
      },
    },
  });

  const topThemes = themeCountsRaw
    .map((theme) => ({
      name: theme.name,
      count: theme.feedbackThemes.length,
    }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const channels = channelsList.map((c) => c.channel);

  const channelDistribution = channelDistributionGroup.map((c) => ({
    name: c.channel,
    count: c._count._all,
  }));

  return (
    <main className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Overview Dashboard
        </h1>
        <p className="text-text-secondary text-sm">
          Analytics, trends, and summary of your customer feedback loop.
        </p>
      </div>

      {/* Analytics Component */}
      <DashboardCharts
        stats={{
          totalCount,
          negativePercent,
          newThisWeek,
        }}
        sentimentBreakdown={sentimentData}
        volumeOverTime={volumeOverTime}
        topThemes={topThemes}
        channelDistribution={channelDistribution}
        channels={channels}
        themes={themes}
        filters={{
          channel,
          sentiment,
          themeId,
          dateRange,
        }}
      />
    </main>
  );
}
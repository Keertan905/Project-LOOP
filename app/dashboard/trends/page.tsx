import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ThemeTrends from "@/components/ThemeTrends";

export default async function TrendsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const workspaceId = session.user.workspaceId;

  // Fetch all themes with their related feedback items
  const themes = await prisma.theme.findMany({
    where: { workspaceId },
    include: {
      feedbackThemes: {
        include: {
          feedback: {
            select: {
              id: true,
              content: true,
              channel: true,
              sentiment: true,
              sentimentScore: true,
              createdAt: true,
              customerLabel: true,
            },
          },
        },
        orderBy: {
          feedback: {
            createdAt: "desc",
          },
        },
      },
    },
  });

  const now = new Date();
  const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Process data for the client component
  const processedThemes = themes.map((theme) => {
    const feedbacks = theme.feedbackThemes.map((ft) => ft.feedback);

    // Calculate count splits for trends
    let currentPeriodCount = 0;
    let previousPeriodCount = 0;

    feedbacks.forEach((f) => {
      const date = new Date(f.createdAt);
      if (date >= fifteenDaysAgo && date <= now) {
        currentPeriodCount++;
      } else if (date >= thirtyDaysAgo && date < fifteenDaysAgo) {
        previousPeriodCount++;
      }
    });

    // Spike rate: percentage change
    const spikeRate =
      previousPeriodCount === 0
        ? currentPeriodCount * 100 // Avoid division by zero
        : ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100;

    // Daily volume grouping for the last 30 days
    const dailyMap: Record<string, number> = {};
    // Pre-populate last 30 days with 0 to ensure smooth line charts
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().split("T")[0];
      dailyMap[dateKey] = 0;
    }

    feedbacks.forEach((f) => {
      const dateKey = new Date(f.createdAt).toISOString().split("T")[0];
      if (dailyMap[dateKey] !== undefined) {
        dailyMap[dateKey]++;
      }
    });

    const dailyCounts = Object.entries(dailyMap).map(([date, count]) => ({
      date: date.substring(5), // truncate "YYYY-" for clean labels
      count,
    }));

    return {
      id: theme.id,
      name: theme.name,
      description: theme.description,
      color: theme.color,
      totalCount: feedbacks.length,
      currentPeriodCount,
      previousPeriodCount,
      spikeRate,
      dailyCounts,
      feedbacks: feedbacks.map((f) => ({
        id: f.id,
        content: f.content,
        channel: f.channel,
        sentiment: f.sentiment,
        sentimentScore: f.sentimentScore,
        createdAt: f.createdAt.toISOString(),
        customerLabel: f.customerLabel,
      })),
    };
  });

  return (
    <main className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Theme Trends
        </h1>
        <p className="text-slate-400 text-sm">
          Monitor growing topics, spikes, and drill down into clustered feedback.
        </p>
      </div>

      <ThemeTrends initialThemes={processedThemes} />
    </main>
  );
}

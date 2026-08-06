import { prisma } from "./prisma";
import { getEmbedding } from "./embeddings";
import { logger } from "./logger";
import { memoryCache } from "./cache";

// Basic stop words to ignore when performing search ranking
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", 
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", 
  "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", 
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", 
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", 
  "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", 
  "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", 
  "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", 
  "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", 
  "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", 
  "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", 
  "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", 
  "theirs", "them", "themselves", "then", "there", "there's", "these", "they", 
  "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", 
  "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", 
  "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", 
  "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", 
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", 
  "yourself", "yourselves"
]);

interface FeedbackRow {
  id: string;
  content: string;
  channel: string;
  sourceRef: string | null;
  source_ref?: string | null;
  customerLabel: string | null;
  customer_label?: string | null;
  sentiment: "POS" | "NEU" | "NEG";
  sentimentScore: number;
  sentiment_score?: number;
  status: "NEW" | "REVIEWED" | "ACTIONED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string | Date;
  created_at?: string | Date;
  updatedAt: string | Date;
  updated_at?: string | Date;
  workspaceId: string;
  workspace_id?: string;
}

export async function retrieveFeedback(
  workspaceId: string,
  query: string,
  limit = 5
) {
  try {
    // 1. Generate query embedding vector
    const queryVector = await getEmbedding(query);
    const vectorString = `[${queryVector.join(",")}]`;

    // 2. Query Postgres using pgvector cosine similarity (<=> operator)
    const results = await prisma.$queryRaw<FeedbackRow[]>`
      SELECT f.*
      FROM "Feedback" f
      JOIN "Embedding" e ON e."feedbackId" = f.id
      WHERE f."workspaceId" = ${workspaceId}
      ORDER BY (e.vector <=> ${vectorString}::vector) ASC
      LIMIT ${limit};
    `;

    if (results && results.length > 0) {
      // Safely map db keys to standard Prisma camelCase format
      return results.map((row) => ({
        id: row.id,
        content: row.content,
        channel: row.channel,
        sourceRef: row.sourceRef ?? row.source_ref ?? null,
        customerLabel: row.customerLabel ?? row.customer_label ?? null,
        sentiment: row.sentiment,
        sentimentScore: Number(row.sentimentScore ?? row.sentiment_score ?? 0),
        status: row.status,
        priority: row.priority,
        createdAt: new Date(row.createdAt ?? row.created_at),
        updatedAt: new Date(row.updatedAt ?? row.updated_at),
        workspaceId: row.workspaceId ?? row.workspace_id,
      }));
    }
  } catch (err) {
    logger.warn("Vector similarity search failed, falling back to keyword search", { query, workspaceId, error: err });
  }


  // 3. Fallback Keyword Search
  const keywords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  const feedbackItems = await prisma.feedback.findMany({
    where: {
      workspaceId,
    },
    include: {
      feedbackThemes: {
        include: {
          theme: true,
        },
      },
    },
  });

  if (keywords.length === 0) {
    return feedbackItems.slice(0, limit);
  }

  const scoredItems = feedbackItems.map((item) => {
    const contentLower = item.content.toLowerCase();
    let score = 0;

    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g");
      const matches = contentLower.match(regex);
      if (matches) {
        score += matches.length * 2;
      } else if (contentLower.includes(keyword)) {
        score += 1;
      }
    });

    return { item, score };
  });

  const filtered = scoredItems.filter((x) => x.score > 0);
  const targetList = filtered.length > 0 ? filtered : scoredItems;

  return targetList
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}


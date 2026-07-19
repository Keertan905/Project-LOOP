import { prisma } from "./prisma";

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

export async function retrieveFeedback(
  workspaceId: string,
  query: string,
  limit = 5
) {
  // 1. Clean query and extract keywords
  const keywords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  // 2. Query workspace feedback items
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
    // Fallback if no keywords found: return top 5 items
    return feedbackItems.slice(0, limit);
  }

  // 3. Score and rank items based on keyword matches
  const scoredItems = feedbackItems.map((item) => {
    const contentLower = item.content.toLowerCase();
    let score = 0;

    keywords.forEach((keyword) => {
      // Direct keyword count
      const regex = new RegExp(`\\b${keyword}\\b`, "g");
      const matches = contentLower.match(regex);
      if (matches) {
        score += matches.length * 2; // Keyword match bonus
      } else if (contentLower.includes(keyword)) {
        score += 1; // Substring match bonus
      }
    });

    return { item, score };
  });

  // 4. Sort by score desc, filter out items with 0 score (if we have matches), and take top-K
  const filtered = scoredItems.filter((x) => x.score > 0);
  const targetList = filtered.length > 0 ? filtered : scoredItems;

  return targetList
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}

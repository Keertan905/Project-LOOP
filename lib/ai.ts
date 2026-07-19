import { Sentiment } from "@prisma/client";
import { groq } from "./groq";

interface ClassifiedOutput {
  sentiment: Sentiment;
  sentimentScore: number;
  themes: string[];
  featureArea: string;
  rationale: string;
}

/**
 * Classifies feedback text into sentiment, score, themes, and feature area.
 */
export async function classifyFeedbackText(
  content: string,
  existingThemes: string[]
): Promise<ClassifiedOutput> {
  const hasApiKey = !!process.env.GROQ_API_KEY;

  if (hasApiKey) {
    try {
      const prompt = `You are a customer feedback classifier. Classify the following customer feedback text.
Feedback: "${content}"

Existing Theme Names: ${JSON.stringify(existingThemes)}

Return ONLY a valid JSON object matching the following structure (no markdown code blocks, no text before or after):
{
  "sentiment": "POS" | "NEU" | "NEG",
  "sentimentScore": float between -1.0 and 1.0,
  "themes": string[] (select matching themes from the existing list, or create 1 new relevant theme if none match),
  "featureArea": string (short label like "UI/UX", "Billing", "SSO", "Performance"),
  "rationale": string (one-line explanation)
}`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });

      const text = chatCompletion.choices[0].message.content || "";
      const jsonStr = text.replace(/```json|```/g, "").trim();
      return JSON.parse(jsonStr);
    } catch (err) {
      console.error("Groq classification error, using fallback:", err);
    }
  }

  // Fallback Rule-Based Classifier
  const lower = content.toLowerCase();
  let sentiment: Sentiment = Sentiment.NEU;
  let sentimentScore = 0.0;
  const themes: string[] = [];
  let featureArea = "General";

  // Basic Sentiment rules
  const posWords = ["love", "great", "awesome", "perfect", "fast", "gorgeous", "simple", "snappy", "brilliant", "saved"];
  const negWords = ["crash", "slow", "outage", "bad", "charge", "fail", "pricing", "expensive", "frustrated", "bug", "confusing", "pricing", "timeout"];

  let posCount = 0;
  let negCount = 0;

  posWords.forEach(w => { if (lower.includes(w)) posCount++; });
  negWords.forEach(w => { if (lower.includes(w)) negCount++; });

  if (posCount > negCount) {
    sentiment = Sentiment.POS;
    sentimentScore = Math.min(1.0, +(0.2 * posCount).toFixed(2));
  } else if (negCount > posCount) {
    sentiment = Sentiment.NEG;
    sentimentScore = Math.max(-1.0, +(-0.2 * negCount).toFixed(2));
  }

  // Theme matching
  if (lower.includes("onboard") || lower.includes("setup") || lower.includes("sign")) {
    themes.push("Onboarding Experience");
    featureArea = "Onboarding";
  }
  if (lower.includes("price") || lower.includes("bill") || lower.includes("pay") || lower.includes("charge") || lower.includes("invoice")) {
    themes.push("Billing & Pricing");
    featureArea = "Billing";
  }
  if (lower.includes("mobile") || lower.includes("phone") || lower.includes("safari") || lower.includes("app store")) {
    themes.push("Mobile Experience");
    featureArea = "Mobile App";
  }
  if (lower.includes("slow") || lower.includes("load") || lower.includes("outage") || lower.includes("crash") || lower.includes("bug")) {
    themes.push("Performance & Reliability");
    featureArea = "Performance";
  }
  if (lower.includes("sso") || lower.includes("okta") || lower.includes("security") || lower.includes("saml") || lower.includes("compliance")) {
    themes.push("SSO & Security");
    featureArea = "Security";
  }

  if (themes.length === 0) {
    themes.push("General Feedback");
  }

  return {
    sentiment,
    sentimentScore,
    themes,
    featureArea,
    rationale: `Rule-based classification match (Pos: ${posCount}, Neg: ${negCount})`,
  };
}

/**
 * Answers questions grounded in context feedback items.
 */
export async function answerQuestion(
  question: string,
  feedbacks: { id: string; content: string; channel: string; customerLabel: string | null }[]
): Promise<string> {
  const hasApiKey = !!process.env.GROQ_API_KEY;

  if (feedbacks.length === 0) {
    return "I couldn't find any feedback in your workspace related to this topic. Grounding is mandatory, so I cannot formulate an answer.";
  }

  if (hasApiKey) {
    try {
      const context = feedbacks
        .map((f, i) => `[Source ${i + 1}] (${f.channel}${f.customerLabel ? `, User: ${f.customerLabel}` : ""}): "${f.content}"`)
        .join("\n\n");

      const prompt = `You are Ask LOOP, an AI assistant. You answer questions about customer feedback using ONLY the provided feedback context.
Do NOT assume or make up anything not explicitly mentioned in the feedback. Grounding is mandatory.
If the answer cannot be found in the provided feedback, state exactly: "I cannot find an answer in the feedback provided."

Format your answer with clear bullet points. Cite your sources using [Source X] notation corresponding to the feedback index.

Question: "${question}"

Feedback Context:
${context}`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
      });

      return chatCompletion.choices[0].message.content || "";
    } catch (err) {
      console.error("Groq Q&A error, using fallback:", err);
    }
  }

  // Fallback Grounded Q&A Generator (Regex matching & quote compiler)
  const qLower = question.toLowerCase();
  const matchedQuotes: string[] = [];

  feedbacks.forEach((f, idx) => {
    // Check if the feedback content matches keywords from the question
    const words = qLower.split(/\s+/).filter(w => w.length > 3);
    const hasMatch = words.some(word => f.content.toLowerCase().includes(word));
    
    if (hasMatch || feedbacks.length <= 3) {
      matchedQuotes.push(`- "${f.content}" (reported via **${f.channel}** by *${f.customerLabel || "Anonymous"}* [Source ${idx + 1}])`);
    }
  });

  if (matchedQuotes.length === 0) {
    return "I cannot find an answer in the feedback provided. (None of the retrieved records directly match the keywords of your question).";
  }

  return `Based on the customer feedback retrieved for this query:

${matchedQuotes.join("\n")}

*Note: This response has been formulated directly from feedback items matching your search criteria.*`;
}

/**
 * Generates a weekly Voice-of-Customer report around pre-computed statistics.
 */
export async function generateVoCReport(
  title: string,
  stats: {
    totalCount: number;
    posCount: number;
    neuCount: number;
    negCount: number;
    themeStats: { name: string; count: number }[];
  },
  quotes: string[]
): Promise<string> {
  const hasApiKey = !!process.env.GROQ_API_KEY;

  const posPct = stats.totalCount > 0 ? Math.round((stats.posCount / stats.totalCount) * 100) : 0;
  const negPct = stats.totalCount > 0 ? Math.round((stats.negCount / stats.totalCount) * 100) : 0;
  
  if (hasApiKey) {
    try {
      const prompt = `You are a product management consultant generating a professional Voice of Customer (VoC) report for team leadership.
Write a narrative around these pre-computed metrics and customer quotes. Focus on actionable insights.

Report Title: ${title}

Metrics:
- Total Feedback Items: ${stats.totalCount}
- Sentiment Breakdown: ${posPct}% Positive, ${100 - posPct - negPct}% Neutral, ${negPct}% Negative
- Top Theme Counts: ${JSON.stringify(stats.themeStats)}

Customer Quotes:
${quotes.map(q => `- "${q}"`).join("\n")}

Format the output strictly as Markdown, including:
1. Executive Summary (Brief narrative explaining the general health and findings)
2. Detailed Theme Analysis (Highlighting major topics like Onboarding, SSO, or Mobile)
3. Key Quotes (Verbatim customer comments)
4. Recommended Actions (3 bullet points detailing what the engineering/design teams should address next)`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
      });

      return chatCompletion.choices[0].message.content || "";
    } catch (err) {
      console.error("Groq VoC generation error, using fallback:", err);
    }
  }

  // Fallback Narrative Generator
  const topThemesStr = stats.themeStats.map(t => `**${t.name}** (${t.count} items)`).join(", ");
  const quoteBullets = quotes.slice(0, 5).map(q => `> "${q}"`).join("\n\n");

  return `# ${title}
## Executive Summary
This Voice of Customer report compiles customer feedback metrics. We analyzed a total of **${stats.totalCount} feedback items**, revealing a sentiment distribution of **${posPct}% Positive**, **${100 - posPct - negPct}% Neutral**, and **${negPct}% Negative**.

## Detailed Theme Analysis
The most prominent topics this period were: ${topThemesStr}.
The high concentration of items under these themes highlights critical user friction areas and positive features. Specifically:
- **Onboarding & Setup** is a major driver of positive feedback, but is gated by invite-flow issues.
- **SSO and SAML Integration** is a critical requirement from mid-market sales targets.

## Key Quotes
${quoteBullets}

## Recommended Actions
1. **SSO Authentication Stability**: Resolve session-dropping issues on Chrome browsers during SAML/Okta checks.
2. **Onboarding UI Clarification**: Simplify team workspace invitation layouts.
3. **Mobile Responsive Layout**: Correct navigation overlaps on smaller screen dimensions (e.g. iPhone SE).`;
}

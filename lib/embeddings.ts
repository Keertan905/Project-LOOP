export function getDeterministicMockVector(text: string): number[] {
  const vector = new Array(1536).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate a deterministic unit-length vector based on the string hash
  for (let j = 0; j < 1536; j++) {
    const seed = Math.sin(hash + j) * 10000;
    vector[j] = seed - Math.floor(seed) - 0.5; // Normalized float between -0.5 and 0.5
  }
  
  // Normalize vector to unit length
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / (magnitude || 1));
}

export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: text.slice(0, 8000), // Avoid token limits
          model: "text-embedding-3-small",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result?.data?.[0]?.embedding) {
          return result.data[0].embedding;
        }
      }
      console.warn("OpenAI Embedding API error, falling back to mock vector:", response.statusText);
    } catch (err) {
      console.error("OpenAI Embedding fetch failed, falling back to mock vector:", err);
    }
  }

  // Graceful deterministic fallback
  return getDeterministicMockVector(text);
}

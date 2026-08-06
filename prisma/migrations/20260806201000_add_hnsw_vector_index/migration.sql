-- Create HNSW index on Embedding table for high-performance pgvector similarity search
CREATE INDEX IF NOT EXISTS "Embedding_vector_hnsw_idx" 
ON "Embedding" 
USING hnsw (vector vector_cosine_ops);

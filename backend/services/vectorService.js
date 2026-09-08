import { ChromaClient } from 'chromadb'

const client = new ChromaClient({ path: process.env.CHROMA_URL || 'http://localhost:8000' })
const COLLECTION_NAME = 'pdf-chatbot-documents'

async function getCollection() {
  return client.getOrCreateCollection({ name: COLLECTION_NAME })
}

/**
 * Store chunk embeddings for a document. `embed` is injected so this
 * module stays agnostic about which embedding provider is used.
 */
export async function storeChunks(documentId, chunks, embed) {
  const collection = await getCollection()
  const embeddings = await embed(chunks.map((c) => c.content))
  await collection.add({
    ids: chunks.map((c) => `${documentId}-${c.id}`),
    embeddings,
    documents: chunks.map((c) => c.content),
    metadatas: chunks.map((c) => ({ documentId, page: c.page ?? null, chunkId: c.id })),
  })
}

/**
 * Retrieve the most relevant chunks for a question's embedding.
 */
export async function queryChunks(documentId, questionEmbedding, topK = 5) {
  const collection = await getCollection()
  const results = await collection.query({
    queryEmbeddings: [questionEmbedding],
    nResults: topK,
    where: { documentId },
  })
  return results
}

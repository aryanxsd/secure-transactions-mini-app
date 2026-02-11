import fastify from "fastify"
import cors from "@fastify/cors"
import {
  encryptEnvelope,
  decryptEnvelope,
  TxSecureRecord
} from "@secure/crypto"

const app = fastify({ logger: true })

await app.register(cors, {
  origin: true
})

const store = new Map<string, TxSecureRecord>()

app.post("/tx/encrypt", async (request, reply) => {
  const body = request.body as {
    partyId?: string
    payload?: object
  }

  if (!body?.partyId || !body?.payload) {
    reply.code(400)
    return { error: "partyId and payload are required" }
  }

  const record = encryptEnvelope(body.payload, body.partyId)
  store.set(record.id, record)

  return record
})

app.get("/tx/:id", async (request, reply) => {
  const { id } = request.params as { id: string }

  const record = store.get(id)
  if (!record) {
    reply.code(404)
    return { error: "Transaction not found" }
  }

  return record
})

app.post("/tx/:id/decrypt", async (request, reply) => {
  const { id } = request.params as { id: string }

  const record = store.get(id)
  if (!record) {
    reply.code(404)
    return { error: "Transaction not found" }
  }

  try {
    const payload = decryptEnvelope(record)
    return payload
  } catch {
    reply.code(400)
    return { error: "Decryption failed or data tampered" }
  }
})

/*
 ✅ LOCAL MODE
*/
if (process.env.NODE_ENV !== "production") {
  app.listen({ port: 3001 }).then(() => {
    console.log("API running on http://localhost:3001")
  })
}

/*
 ✅ SERVERLESS MODE (Vercel / Netlify)
*/
export default async function handler(req: any, res: any) {
  await app.ready()
  app.server.emit("request", req, res)
}

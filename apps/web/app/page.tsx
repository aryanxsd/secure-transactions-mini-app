"use client"

import { useState } from "react"
import "./page.css"

const API = process.env.NEXT_PUBLIC_API_URL!

export default function Home() {
  const [partyId, setPartyId] = useState("")
  const [payload, setPayload] = useState(
    `{ "amount": 1, "currency": "AED" }`
  )

  const [tx, setTx] = useState<any>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // -----------------------------
  // Encrypt & Save
  // -----------------------------
  async function encrypt() {
    try {
      setLoading(true)
      setError(null)

      // IMPORTANT: clear old states
      setTx(null)
      setResult(null)

      const res = await fetch(`${API}/tx/encrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partyId,
          payload: JSON.parse(payload)
        })
      })

      if (!res.ok) {
        throw new Error("Encryption failed")
      }

      const data = await res.json()
      setTx(data)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // -----------------------------
  // Decrypt
  // -----------------------------
  async function decrypt() {
    if (!tx?.id) return

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `${API}/tx/${tx.id}/decrypt`,
        { method: "POST" }
      )

      if (!res.ok) {
        throw new Error("Decryption failed")
      }

      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container">
      <h1>🔐 Secure Transaction Demo</h1>

      {/* INPUT CARD */}
      <div className="card">
        <label>Party ID</label>
        <input
          value={partyId}
          onChange={(e) => setPartyId(e.target.value)}
          placeholder="party_123"
        />

        <label>Payload (JSON)</label>
        <textarea
          rows={5}
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
        />

        <button
          className="encrypt"
          onClick={encrypt}
          disabled={loading}
        >
          {loading ? "Encrypting..." : "Encrypt & Save"}
        </button>

        {tx?.id && (
          <button
            className="decrypt"
            onClick={decrypt}
            disabled={loading}
          >
            {loading ? "Decrypting..." : "Decrypt"}
          </button>
        )}

        {error && (
          <p style={{ color: "red", marginTop: 10 }}>
            {error}
          </p>
        )}
      </div>

      {/* ENCRYPTED RECORD */}
      {tx && (
        <div className="card">
          <h3>🔒 Encrypted Record</h3>
          <pre>{JSON.stringify(tx, null, 2)}</pre>
        </div>
      )}

      {/* DECRYPTED PAYLOAD */}
      {result && (
        <div className="card">
          <h3>✅ Decrypted Payload</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </main>
  )
}

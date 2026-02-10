import { describe, it, expect } from "vitest"
import { encryptEnvelope, decryptEnvelope } from "../src/envelope"
import type { TxSecureRecord } from "../src/types"

describe("Envelope Encryption", () => {
  const payload = {
    amount: 100,
    currency: "AED",
    meta: { orderId: "ORD-1" },
  }

  it("encrypt → decrypt returns original payload", () => {
    const record = encryptEnvelope(payload, "party_1")
    const decrypted = decryptEnvelope(record)

    expect(decrypted).toEqual(payload)
  })
})

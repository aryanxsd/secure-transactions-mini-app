import * as crypto from "crypto"
import { TxSecureRecord } from "./types.js"

const NONCE_LEN = 12
const TAG_LEN = 16

const MASTER_KEY = crypto
    .createHash("sha256")
    .update("MASTER_KEY_V1")
    .digest()

function assertHex(value: string, byteLen?: number) {
    if (!/^[0-9a-f]+$/i.test(value)) {
        throw new Error("Invalid hex")
    }
    if (byteLen && value.length !== byteLen * 2) {
        throw new Error("Invalid byte length")
    }
}

export function encryptEnvelope(
    payload: object,
    partyId: string
): TxSecureRecord {
    const dek = crypto.randomBytes(32)

    const payloadNonce = crypto.randomBytes(NONCE_LEN)
    const cipher = crypto.createCipheriv("aes-256-gcm", dek, payloadNonce)

    const payloadCt = Buffer.concat([
        cipher.update(JSON.stringify(payload), "utf8"),
        cipher.final()
    ])
    const payloadTag = cipher.getAuthTag()

    const wrapNonce = crypto.randomBytes(NONCE_LEN)
    const wrapCipher = crypto.createCipheriv(
        "aes-256-gcm",
        MASTER_KEY,
        wrapNonce
    )

    const dekWrapped = Buffer.concat([
        wrapCipher.update(dek),
        wrapCipher.final()
    ])
    const wrapTag = wrapCipher.getAuthTag()

    return {
        id: crypto.randomUUID(),
        partyId,
        createdAt: new Date().toISOString(),

        payload_nonce: payloadNonce.toString("hex"),
        payload_ct: payloadCt.toString("hex"),
        payload_tag: payloadTag.toString("hex"),

        dek_wrap_nonce: wrapNonce.toString("hex"),
        dek_wrapped: dekWrapped.toString("hex"),
        dek_wrap_tag: wrapTag.toString("hex"),

        alg: "AES-256-GCM",
        mk_version: 1
    }
}

export function decryptEnvelope(record: TxSecureRecord): object {
    assertHex(record.payload_nonce, NONCE_LEN)
    assertHex(record.payload_tag, TAG_LEN)
    assertHex(record.dek_wrap_nonce, NONCE_LEN)
    assertHex(record.dek_wrap_tag, TAG_LEN)

    const unwrap = crypto.createDecipheriv(
        "aes-256-gcm",
        MASTER_KEY,
        Buffer.from(record.dek_wrap_nonce, "hex")
    )
    unwrap.setAuthTag(Buffer.from(record.dek_wrap_tag, "hex"))

    const dek = Buffer.concat([
        unwrap.update(Buffer.from(record.dek_wrapped, "hex")),
        unwrap.final()
    ])

    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        dek,
        Buffer.from(record.payload_nonce, "hex")
    )
    decipher.setAuthTag(Buffer.from(record.payload_tag, "hex"))

    const plaintext = Buffer.concat([
        decipher.update(Buffer.from(record.payload_ct, "hex")),
        decipher.final()
    ])

    return JSON.parse(plaintext.toString("utf8"))
}

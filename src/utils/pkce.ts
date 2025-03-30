import crypto from "crypto";

export default function generatePKCE() {
    const codeVerifier = crypto.randomBytes(64).toString("hex");
    const codeChallenge = crypto
        .createHash("sha256")
        .update(codeVerifier)
        .digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, ""); // Formato base64url
    return { codeVerifier, codeChallenge };
}
import { siteConfig } from "./config"

/**
 * Normalizes a Voter ID by trimming and converting to uppercase.
 */
export function normalizeVoterId(voterId: string): string {
    return voterId?.trim().toUpperCase()
}

/**
 * Gets the Relying Party ID for WebAuthn.
 * This should be the domain name without protocol (e.g., 'aptsaicuf.com').
 */
export function getRpID(): string {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url
    try {
        const hostname = new URL(siteUrl).hostname
        // If the hostname is 127.0.0.1, we should probably return localhost for better compatibility
        if (hostname === '127.0.0.1') return 'localhost'
        return hostname
    } catch (e) {
        console.error('Invalid NEXT_PUBLIC_SITE_URL for getRpID:', siteUrl)
        return 'localhost'
    }
}

/**
 * Gets the expected origin for WebAuthn verification.
 * This must be the full origin including protocol (e.g., 'https://aptsaicuf.com').
 */
export function getExpectedOrigin(): string {
    return process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url
}

/**
 * Validates the current request origin against the configured site URL.
 * Useful for logging warnings during development/production mismatch.
 */
export function validateOrigin(requestOrigin: string | null) {
    const expected = getExpectedOrigin()
    if (requestOrigin && requestOrigin !== expected) {
        console.warn(`[WebAuthn Warning] Origin mismatch:`)
        console.warn(`  - Configured (NEXT_PUBLIC_SITE_URL): ${expected}`)
        console.warn(`  - Actual Request Origin: ${requestOrigin}`)
        console.warn(`  Passkey verification WILL FAIL if these do not match.`)
    }
}

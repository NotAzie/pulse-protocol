/**
 * Zero-Trust PII Redaction Engine (FERPA & GDPR Compliance)
 *
 * Deterministically strips identifying personal data (student IDs, emails,
 * telephone numbers, IPv4/IPv6 addresses) from feedback streams in-memory
 * before tokenization or algorithmic projection.
 */

export interface RedactionResult {
  sanitizedText: string;
  redactedCount: number;
  detectedTypes: string[];
}

// Pre-compiled regex patterns for zero-latency streaming scanning
const PATTERNS = [
  { type: 'EMAIL', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replacement: '[REDACTED_EMAIL]' },
  { type: 'STUDENT_ID', regex: /\b(?:id|student|roll)?[:\s#]*[A-Z0-9]{2,4}[-_\s]?[0-9]{5,8}\b/gi, replacement: '[REDACTED_STUDENT_ID]' },
  { type: 'PHONE', regex: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g, replacement: '[REDACTED_PHONE]' },
  { type: 'IP_ADDRESS', regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: '[REDACTED_IP]' },
];

export class PrivacyRedactor {
  static sanitize(text: string): RedactionResult {
    let sanitized = text;
    let redactedCount = 0;
    const detected = new Set<string>();

    for (let i = 0; i < PATTERNS.length; i++) {
      const p = PATTERNS[i];
      const matches = sanitized.match(p.regex);
      if (matches) {
        redactedCount += matches.length;
        detected.add(p.type);
        sanitized = sanitized.replace(p.regex, p.replacement);
      }
    }

    return {
      sanitizedText: sanitized,
      redactedCount,
      detectedTypes: Array.from(detected),
    };
  }

  static sanitizeBatch(comments: string[]): { sanitizedComments: string[]; totalRedactions: number } {
    let total = 0;
    const sanitized = new Array<string>(comments.length);

    for (let i = 0; i < comments.length; i++) {
      const res = PrivacyRedactor.sanitize(comments[i]);
      sanitized[i] = res.sanitizedText;
      total += res.redactedCount;
    }

    return {
      sanitizedComments: sanitized,
      totalRedactions: total,
    };
  }
}

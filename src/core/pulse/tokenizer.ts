/**
 * ZeroCopyStreamTokenizer
 *
 * Scans UTF-16 code units directly over the input string without allocating
 * intermediate string arrays or slices. Computes 32-bit FNV-1a hashes on the fly
 * to achieve O(1) amortized token matching.
 */

export interface TokenSpan {
  start: number;
  end: number;
  hash: number;
  isEmoji: boolean;
}

const FNV_PRIME = 0x01000193;
const FNV_OFFSET_BASIS = 0x811c9dc5;

export function fnv1a(str: string, start = 0, end = str.length): number {
  let hash = FNV_OFFSET_BASIS;
  for (let i = start; i < end; i++) {
    const c = str.charCodeAt(i);
    const lower = c >= 65 && c <= 90 ? c + 32 : c;
    hash ^= lower;
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
}

function isDelimiter(code: number): boolean {
  // Whitespace (<= 32), punctuation: ! " # $ % & ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~
  return (
    code <= 32 ||
    (code >= 33 && code <= 47 && code !== 39) || // standard punctuation except apostrophe
    (code >= 58 && code <= 64) ||
    (code >= 91 && code <= 96) ||
    (code >= 123 && code <= 126)
  );
}

export class ZeroCopyStreamTokenizer {
  private text: string;
  private len: number;

  constructor(text: string) {
    this.text = text;
    this.len = text.length;
  }

  /**
   * Lazily iterate through token spans without heap allocations.
   */
  *tokens(): Generator<TokenSpan, void, unknown> {
    const text = this.text;
    const len = this.len;
    let i = 0;

    while (i < len) {
      const code = text.charCodeAt(i);

      // Skip delimiters
      if (isDelimiter(code)) {
        i++;
        continue;
      }

      // Check emoji surrogate pair or high unicode symbol
      if (code >= 0xd800 && code <= 0xdbff && i + 1 < len) {
        const start = i;
        i += 2;
        yield {
          start,
          end: i,
          hash: fnv1a(text, start, i),
          isEmoji: true,
        };
        continue;
      }

      // Standard token
      const start = i;
      let hash = FNV_OFFSET_BASIS;

      while (i < len) {
        const c = text.charCodeAt(i);
        if (isDelimiter(c)) {
          break;
        }
        // Normalize ASCII lowercase inline
        const lowerChar = c >= 65 && c <= 90 ? c + 32 : c;
        hash ^= lowerChar;
        hash = Math.imul(hash, FNV_PRIME);
        i++;
      }

      if (i > start) {
        yield {
          start,
          end: i,
          hash: hash >>> 0,
          isEmoji: false,
        };
      } else {
        i++;
      }
    }
  }

  /**
   * Extract token string only when requested.
   */
  substring(span: TokenSpan): string {
    return this.text.slice(span.start, span.end);
  }
}

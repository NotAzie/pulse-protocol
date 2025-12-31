/**
 * ZeroCopyStreamTokenizer — High-Throughput Lexical Scanner
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
  return (
    code <= 32 ||
    (code >= 33 && code <= 47 && code !== 39) ||
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
   * High-speed callback scanner eliminating generator allocation overhead.
   */
  scan(callback: (span: TokenSpan) => void | boolean): void {
    const text = this.text;
    const len = this.len;
    let i = 0;

    while (i < len) {
      const code = text.charCodeAt(i);
      if (isDelimiter(code)) {
        i++;
        continue;
      }

      if (code >= 0xd800 && code <= 0xdbff && i + 1 < len) {
        const start = i;
        i += 2;
        const cont = callback({
          start,
          end: i,
          hash: fnv1a(text, start, i),
          isEmoji: true,
        });
        if (cont === false) return;
        continue;
      }

      const start = i;
      let hash = FNV_OFFSET_BASIS;

      while (i < len) {
        const c = text.charCodeAt(i);
        if (isDelimiter(c)) {
          break;
        }
        const lowerChar = c >= 65 && c <= 90 ? c + 32 : c;
        hash ^= lowerChar;
        hash = Math.imul(hash, FNV_PRIME);
        i++;
      }

      if (i > start) {
        const cont = callback({
          start,
          end: i,
          hash: hash >>> 0,
          isEmoji: false,
        });
        if (cont === false) return;
      } else {
        i++;
      }
    }
  }

  /**
   * Lazily iterate through token spans.
   */
  *tokens(): Generator<TokenSpan, void, unknown> {
    const text = this.text;
    const len = this.len;
    let i = 0;

    while (i < len) {
      const code = text.charCodeAt(i);

      if (isDelimiter(code)) {
        i++;
        continue;
      }

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

      const start = i;
      let hash = FNV_OFFSET_BASIS;

      while (i < len) {
        const c = text.charCodeAt(i);
        if (isDelimiter(c)) {
          break;
        }
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

  substring(span: TokenSpan): string {
    return this.text.slice(span.start, span.end);
  }
}

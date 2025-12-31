# Contributing to PulseProtocol

This document establishes the technical guidelines, algorithmic invariants, and contribution standards for PulseProtocol.

---

## 1. Algorithmic Invariants

All pull requests modifying the core substrate (`src/core/`) must adhere to strict computational complexity and allocation constraints:

1. **Zero-Allocation Hot Paths:** Lexical tokenization (`ZeroCopyStreamTokenizer`) and metric projections must not allocate intermediate objects or strings in repetitive loops. Use typed arrays (`Int32Array`, `Float64Array`) and bitwise operations.
2. **Sub-Linear Complexity:** Document deduplication and similarity queries must utilize the 64-bit SimHash Hamming space with hardware popcount ($O(1)$ bitwise evaluation).
3. **Decoupled Architecture:** Core algorithmic modules must remain completely isolated from presentation or DOM dependencies. Never import React or UI components into `src/core/`.
4. **Deterministic Reproducibility:** Core algorithms must yield bit-for-bit identical outputs across environments given identical seeds and inputs.

---

## 2. Development Setup

Requirements:
- Node.js >= 22.0.0
- pnpm == 11.25.0
- TypeScript == 5.7.2

```sh
# Clone repository
git clone https://github.com/NotAzie/pulse-protocol.git
cd pulse-protocol

# Install dependencies
pnpm install

# Run test suite
pnpm test

# Build production bundle
pnpm build
```

---

## 3. Pull Request Guidelines

1. **Test Coverage:** Every bug fix or feature must include comprehensive unit or integration tests under the corresponding `*.test.ts` suite.
2. **Type Safety:** The repository enforces strict TypeScript flags (`strict: true`, `noImplicitAny: true`, `verbatimModuleSyntax: true`). Run `pnpm build` before submitting.
3. **Commit Conventions:** Follow the Conventional Commits specification:
   - `feat(...)`: New user-facing or protocol functionality
   - `fix(...)`: Algorithmic or logic correction
   - `perf(...)`: Computational or memory optimization
   - `refactor(...)`: Architectural restructuring without behavior change
   - `docs(...)`: Documentation and technical specifications
4. **Code Style:** Zero emojis in code comments or documentation. Maintain a clinical, precise, and professional tone throughout.

# Security Policy

## 1. Supported Versions

Security updates and critical patches are actively maintained for the following releases:

| Version | Supported | Status |
|---|---|---|
| 1.0.x | Yes | Current Release |
| < 1.0.0 | No | End of Life |

---

## 2. Threat Model and Runtime Isolation

PulseProtocol is architected as an offline-first, client-side cognitive operating protocol. The runtime security perimeter is defined by the following architectural guarantees:

1. **Zero External Ingress/Egress:** Core inference, tokenization, and causal graph synthesis execute strictly within the host client runtime (browser WebAssembly / V8 Web Worker). No network requests are dispatched to external AI model providers or centralized databases.
2. **Volatile In-Memory Redaction:** The `PrivacyRedactor` module executes prior to document indexing, deterministically sanitizing student IDs, email addresses, phone numbers, and IPv4 addresses directly in memory.
3. **Cryptographic Audit Integrity:** State mutations and analytical outputs are hashed using SHA-256 and chained into an immutable Merkle tree ledger via `AuditLedger`. Any retrospective modification of intermediate state invalidates the cryptographic root.
4. **Sandboxed ReAct Agent Execution:** The `AutonomousAgentEngine` operates within strict iteration limits (max 5 steps per task) and only invokes declared, deterministic tools.

---

## 3. Reporting a Vulnerability

If you discover a security vulnerability, side-channel leak, or cryptographic integrity issue within PulseProtocol, please report it via private disclosure rather than opening a public issue.

Submit a detailed report to the maintainers via:
- GitHub Security Advisories: Submit via repository Security tab
- Contact: `mazinullah317@gmail.com`

Please include the following details:
- Affected component or algorithmic module
- Detailed steps to reproduce or proof-of-concept payload
- Assessment of impact on client data sovereignty or memory isolation
- Suggested remediation or patch, if available

Maintainers will acknowledge receipt within 48 hours and provide regular status updates until a coordinated disclosure is released.

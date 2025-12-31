import { describe, it, expect, beforeEach } from 'vitest';
import { PrivacyRedactor } from './privacy';
import { AuditLedger } from './ledger';
import { WebhookDispatcher } from '../agent/dispatcher';

describe('Autonomous Security, Governance & Incident Dispatch Engine', () => {
  beforeEach(() => {
    AuditLedger.reset();
    WebhookDispatcher.clear();
  });

  describe('PrivacyRedactor (Zero-Trust PII Sanitization)', () => {
    it('redacts student emails, phone numbers, and IDs deterministically', () => {
      const raw = 'Student alice.smith@university.edu (ID: STU-882914) called at 555-019-2834 regarding the cafeteria.';
      const res = PrivacyRedactor.sanitize(raw);

      expect(res.redactedCount).toBeGreaterThanOrEqual(3);
      expect(res.sanitizedText).toContain('[REDACTED_EMAIL]');
      expect(res.sanitizedText).toContain('[REDACTED_PHONE]');
      expect(res.sanitizedText).not.toContain('alice.smith@university.edu');
    });

    it('processes batch sanitization in a single pass', () => {
      const batch = [
        'Contact prof.john@college.edu about grades.',
        'Great workshop session today!',
      ];
      const res = PrivacyRedactor.sanitizeBatch(batch);
      expect(res.sanitizedComments.length).toBe(2);
      expect(res.totalRedactions).toBe(1);
    });
  });

  describe('AuditLedger (Cryptographic Merkle Chaining)', () => {
    it('seals immutable blocks and verifies chain integrity', () => {
      const block1 = AuditLedger.sealBlock(['Comment 1', 'Comment 2']);
      const block2 = AuditLedger.sealBlock(['Comment 3', 'Comment 4']);

      expect(block1.blockHeight).toBe(0);
      expect(block2.blockHeight).toBe(1);
      expect(block2.previousBlockHash).toBe(block1.blockHash);
      expect(AuditLedger.verifyIntegrity()).toBe(true);
    });
  });

  describe('WebhookDispatcher (CloudEvents Resilience)', () => {
    it('creates and dispatches incident events with retry recovery', async () => {
      const incident = WebhookDispatcher.createIncident(
        'Campus Wi-Fi',
        'Deploy High-Density Mesh APs',
        'Severe packet loss in Block B',
        42,
        9.2
      );

      expect(incident.specversion).toBe('1.0');
      expect(incident.data.severity).toBe('CRITICAL');

      // Test successful dispatch with 1 simulated transient failure
      const result = await WebhookDispatcher.dispatch(incident, 1);
      expect(result.status).toBe('DELIVERED');
      expect(result.attemptCount).toBe(2);
      expect(WebhookDispatcher.getDeadLetterQueue().length).toBe(0);
    });

    it('escalates to dead letter queue upon exceeding maximum retries', async () => {
      const incident = WebhookDispatcher.createIncident('Dining', 'Action', 'Desc', 20, 8.0);
      const result = await WebhookDispatcher.dispatch(incident, 5); // Exceeds max 3 attempts

      expect(result.status).toBe('DEAD_LETTER');
      expect(WebhookDispatcher.getDeadLetterQueue().length).toBe(1);
    });
  });
});

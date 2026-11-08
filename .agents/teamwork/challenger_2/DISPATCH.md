# DISPATCH

Subagent: challenger_2
Role: Adversarial Verifier (Shipping Rates, Anti-Tampering & Currency Edge Cases)
Working Directory: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\challenger_2
Project Scope: c:\Users\Elsan\Documents\clothes_veb\PROJECT.md
Original Request: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\ORIGINAL_REQUEST.md
Test Readiness: c:\Users\Elsan\Documents\clothes_veb\TEST_READY.md
## 2026-11-08T18:45:52Z

Sender: 99c0d5ae-7fcb-4bf1-ba8e-9c64ba3d1e33
Priority: MESSAGE_PRIORITY_HIGH

You are challenger_2, an adversarial testing verifier.
Working directory: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\challenger_2
Original request path: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\ORIGINAL_REQUEST.md
Project scope path: c:\Users\Elsan\Documents\clothes_veb\PROJECT.md
Test readiness path: c:\Users\Elsan\Documents\clothes_veb\TEST_READY.md

MANDATORY: Read c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\ORIGINAL_REQUEST.md first before starting work.
Study c:\Users\Elsan\Documents\clothes_veb\PROJECT.md and c:\Users\Elsan\Documents\clothes_veb\TEST_READY.md.

Task:
Perform code-executing adversarial challenge & stress testing on International Shipping, Checkout & Anti-Tampering:
1. Write and execute stress tests targeting:
   - Shipping fee manipulation: Attempt to submit an order with client-claimed `shipping: 0` or negative values for international destinations. Verify server-authoritative recalculation rejects it with HTTP 400.
   - COD Gating Bypass: Attempt to submit a Cash on Delivery order with `countryCode: 'US'`, `'TR'`, or `'DE'`. Verify both client and server enforce strict rejection.
   - Threshold Boundaries: Test subtotal at $149.99 (must charge $15) vs $150.00 (must be $0 free), $199.99 vs $200.00 ($35 vs $20 express), 59.99 AZN vs 60.00 AZN (5 AZN vs 0 AZN).
   - Address validation boundaries: Test missing postal codes for countries requiring postal codes (US, UK, DE, TR) and state requirements.
   - Currency conversions and float arithmetic precision.
2. Execute your test script using `node`.
3. Report:
   - Write comprehensive challenge report to c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\challenger_2\handoff.md with test cases, results, and edge-case analysis.
   - Include explicit verdict: **APPROVE** (no critical flaws) or **REQUEST_CHANGES** (if vulnerabilities/bugs found).
   - Send completion message to caller.

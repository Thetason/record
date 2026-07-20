# Record Autopilot Spec

## Goal
Move Re:cord from "mostly launch-ready" to "operator-ready" by hardening the Lemon payment path, preserving the existing trust-page positioning, and reducing production rollout ambiguity.

## Success Criteria
- Public pricing and upgrade flows consistently redirect to Lemon Squeezy.
- Lemon webhooks can resolve the purchasing user reliably from hosted checkout metadata.
- Production readiness docs reflect the actual launch path: Neon/Postgres + Lemon + optional OCR/email.
- Core verification passes after the payment-path hardening changes.

## Constraints
- Keep changes low-risk and additive.
- Do not introduce schema churn unless strictly necessary.
- Do not remove legacy payment code that may still matter historically unless it is proven unused and safe to remove.
- Favor launch reliability over cleanup perfection.

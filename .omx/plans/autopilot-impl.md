# Record Autopilot Implementation Plan

1. Carry user identity and plan metadata through Lemon hosted checkout URLs so webhook processing is deterministic.
2. Re-verify the Lemon webhook handler and checkout endpoints with build, typecheck, and production preflight.
3. Update launch/operator docs so the human rollout path matches the live code path.
4. Leave legacy providers inert in the primary path, but avoid risky deletions until post-launch cleanup.
5. Summarize verified progress and the next launch-critical tranche.

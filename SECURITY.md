# Security

For vulnerabilities, use GitHub's private vulnerability reporting for Bojan-Ivanovski/fieldnotes-ui when enabled. If it is unavailable, contact the maintainer through the contact method on their GitHub profile; do not post exploit details in a public issue. Include affected package versions, reproduction, impact and suggested mitigation. Never include account credentials or private Fieldnotes data.

The 0.x API is evolving; security fixes target the latest supported release. This repository is currently preparing its initial publication and has no published support history. The library does not authenticate users, authorize resource access, sanitize HTML or persist documents. Consumers must implement those responsibilities and keep dependencies current. React content slots should receive React nodes; do not inject untrusted HTML.

CI and release workflows use least-privilege job permissions. npm publishing is separately dispatched, requires explicit publication selection and a protected environment, and uses OIDC after npm-side trust is configured. See docs/publishing.md for the ownership and release prerequisites.

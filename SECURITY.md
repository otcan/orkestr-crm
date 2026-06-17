# Security Policy

## Supported Versions

Security fixes target the current `main` branch and the latest published public
preview release.

## Reporting A Vulnerability

Do not open a public issue with secrets, real lead data, cookies, message bodies, or exploit details. Report privately to the maintainers using the repository security advisory flow when available.

Include:

- affected commit or version
- affected component
- reproduction steps using synthetic data
- impact
- suggested mitigation, if known

## Data Handling Expectations

Production relationship data is sensitive. Keep `.env`,
`instances/*.local.env`, `.backups/`, database dumps, logs, screenshots,
cookies, browser session state, backup repository names, and connector tokens
out of git and public issue trackers.

The public demo must use synthetic records, reserved domains, and no real
LinkedIn, email, calendar, or Sales Navigator credentials.

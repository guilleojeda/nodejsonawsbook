# Building Highly Available Applications on AWS

Companion code for **Building Highly Available Applications on AWS: From a Single Server to a Scalable and Observable Cloud Architecture**.

The examples are organized by chapter so readers can compare the book's code and commands with working files in this repository.

## Structure

- `simple-aws-nodejs-app/`: baseline app used throughout the book.
- `CodeByChapters/`: chapter-specific snapshots and samples.
- `codeSamples/`: larger reusable samples, including the complete CloudFormation template from Appendix A.

## Local checks

The baseline app and Chapter 13 app include small `npm test` checks. The smoke checks start each app on a temporary local port and verify that `/health` returns HTTP 200 OK. Chapter 13 also checks that the custom CloudWatch metric payload uses the expected namespace and dimensions, and that metric publishing failures do not break the app.

These checks do not replace the full AWS release proof from the book. They confirm that the local Express app can start, answer its health endpoint, and keep the final observability helper non-fatal.

## Errata and edition notes

Use this repository's Issues tab for corrections, errata, and post-publication updates. The final manuscript edition references release tag `v2026.05.23`.

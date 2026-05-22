# Building Highly Available Applications on AWS

Companion code for **Building Highly Available Applications on AWS: From a Single Server to a Scalable and Observable Cloud Architecture**.

The examples are organized by chapter so readers can compare the book's code and commands with working files in this repository.

## Structure

- `simple-aws-nodejs-app/`: baseline app used throughout the book.
- `CodeByChapters/`: chapter-specific snapshots and samples.
- `codeSamples/`: larger reusable samples, including the complete CloudFormation template from Appendix A.

## Local smoke checks

The baseline app and Chapter 13 tracing app include a small `npm test` smoke check that starts the app on a temporary local port and verifies that `/health` returns HTTP 200 OK.

These checks do not replace the full AWS release proof from the book. They only confirm that the local Express app can start and answer its health endpoint.

## Errata and edition notes

Use this repository's Issues tab for corrections, errata, and post-publication updates. A release tag for the final manuscript edition should be cut after the full release proof is complete; until then, treat `main` as the working version.

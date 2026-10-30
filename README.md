# Building Highly Available Applications on AWS

Companion code for **Building Highly Available Applications on AWS: From a Single Server to a Scalable and Observable Cloud Architecture**.

Use release [`v2026.10.30.1`](https://github.com/guilleojeda/nodejsonawsbook/releases/tag/v2026.10.30.1) with the final manuscript. It uses Node.js 26 LTS and includes the corrected AWS CLI setup, IAM examples, dependency locks, trace-only OpenTelemetry configuration, container shutdown and Appendix A template. Earlier tags are preserved for readers using earlier copies of the book.

```bash
git clone https://github.com/guilleojeda/nodejsonawsbook.git
cd nodejsonawsbook
git checkout v2026.10.30.1
```

## Examples and chapter progression

The chapter folders capture different stages of the walkthrough. A local-only listener in Chapter 2 and an environment-configured container listener in later chapters serve different purposes; do not mix their configuration.

| Path | Purpose |
| --- | --- |
| `simple-aws-nodejs-app/` | Runnable, container-ready baseline corresponding to Chapter 4, with local database fallbacks and environment overrides. |
| `CodeByChapters/Chapter2/` | Local setup commands and the initial app, including loopback-only PostgreSQL and HTTP bindings. |
| `CodeByChapters/Chapter3/` | AWS CLI installation commands. |
| `CodeByChapters/Chapter4/` | Dockerfile and build-context exclusions to copy into the working app. |
| `CodeByChapters/Chapter5/` and `CodeByChapters/Chapter6/` | App snapshots that require database environment settings; use the TLS and secret configuration from the book. |
| `CodeByChapters/Chapter9/` | CloudFormation S3 creation and versioning examples. |
| `CodeByChapters/Chapter11/` | Teaching examples for the task execution role, including an intentionally insecure policy and its scoped replacement. |
| `CodeByChapters/Chapter12/` | CodeBuild policy and buildspec to use with the account, Region, repository, connection, artifact bucket and secrets configured in the book. |
| `CodeByChapters/Chapter13/` | Runnable tracing and custom-metrics app used by Appendix A, with a non-root image and its own dependency lockfile. |
| `codeSamples/complete-cloudformation-template.yaml` | Appendix A's infrastructure template, bootstrap commands and outputs. |

The chapter snapshots are snippets, not separate npm projects. The baseline and Chapter 13 folders contain complete npm projects. Follow the book's incremental edits when building the main walkthrough yourself.

## Node.js and dependencies

Node.js 26 LTS is this edition's reference version. Run `nvm use` from the repository root if you use nvm. Both package manifests require Node.js 26 or newer. Use the Node.js 26 examples and images throughout the walkthrough.

Use `npm ci` in either runnable app directory to install its recorded dependency tree. Chapter 13 pins the OpenTelemetry packages to the compatible set in the manuscript, disables SDK metric and log exporters, and sends traces to an ADOT Collector. Do not independently update one OpenTelemetry package to a different release family.

## Local checks

From the repository root:

```bash
cd simple-aws-nodejs-app
npm ci
npm test
```

The smoke check starts the app on a temporary local port and checks `/health`. Database operations need the database, user and table set up in Chapter 2. For the container-ready baseline, set `DB_HOST`, `DB_USER`, `DB_NAME`, `DB_PASS` and `DB_PORT` for the database reachable from the container, as shown in Chapter 4.

For the final sample, start from the repository root:

```bash
cd CodeByChapters/Chapter13
npm ci
npm test
```

Chapter 13 also checks custom metric payloads and that publishing failures remain non-fatal. These checks do not provision AWS or replace the deployment, database, notification, recovery and tracing checks in the book.

## Building Chapter 13 for Aurora

From the repository root, download the RDS CA bundle into the application directory before building. Appendix A's output commands do this too.

```bash
cd CodeByChapters/Chapter13
mkdir -p certs
curl --fail --show-error --location \
  https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem \
  -o certs/global-bundle.pem
docker build --platform linux/amd64 -t simpleawsnodejsapp .
```

Use the task settings in the book or Appendix A: `DB_HOST`, `DB_USER`, `DB_NAME`, `DB_PASS`, `DB_PORT`, `PGSSLMODE=verify-full`, and `NODE_EXTRA_CA_CERTS=/app/certs/global-bundle.pem`. Supply the password through the configured Secrets Manager reference. The writer hostname must remain the TLS verification target.

The Chapter 13 app creates an `id`/`value` table on a fresh Appendix A database before accepting requests, and leaves an existing table unchanged. The manually initialized database in Chapters 2 and 5 also has `created_at`. This startup initializer and use of the master database account are learning shortcuts described in Appendix A.

Run an ADOT Collector with the app and configure the OTLP endpoint and X-Ray task-role permissions as the book shows. The repository's local smoke check does not establish that traces reached AWS.

The Chapter 13 image starts Node directly with `tracing.js` preloaded, so the Node process receives the container's `SIGTERM` and can flush queued traces before exiting. When adding tracing to the app carried forward from Chapter 4, change its Dockerfile command to `CMD ["node", "-r", "./tracing.js", "app.js"]` too. The package's `npm start` command remains available for local use.

## AWS examples

The Chapter 3 installer snippets include post-install shell setup. On Linux and macOS, the current-user AWS CLI installer puts its executable in `${XDG_BIN_HOME:-$HOME/.local/bin}`. Add that directory to the current shell's `PATH` and keep the setting in the appropriate shell startup file, as the snippets explain. If you chose a custom `XDG_BIN_HOME`, preserve that setting before the `PATH` line too. On Windows, close and reopen the terminal after installation before checking the version. Confirm which executable runs and that `aws --version` starts with `aws-cli/2` before configuring credentials.

Replace every named placeholder in the IAM policies and buildspec with the resources created for your walkthrough. CloudWatch log-group names are case-sensitive. Use the exact log-group ARN; where the policy appends `:log-stream:*`, start from the ARN without a trailing `:*`. Keep the database-secret read grant alongside the scoped task execution policy.

The first Chapter 11 policy is deliberately broad so the book can explain the correction. Use the scoped replacement for the completed walkthrough. Never put AWS credentials, database passwords or Docker Hub tokens into these files, an image or Git.

For Appendix A, create the stack with `ServiceDesiredCount=0`, acknowledge its IAM resources, and run the generated image-push commands from `CodeByChapters/Chapter13`. Then update `ImageTag` to the pushed tag and `ServiceDesiredCount` to `2`. Follow the appendix's validation and cleanup instructions; retained KMS keys and other retained resources need the disposition described there.

## Errata and edition notes

Use this repository's Issues tab for corrections and errata. The `v2026.10.30.1` release synchronizes the examples with the final manuscript and its Node.js 26 LTS reference runtime.

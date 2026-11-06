# Building Highly Available Applications on AWS

Companion code for **Building Highly Available Applications on AWS: From a Single Server to a Scalable and Observable Cloud Architecture**.

Use release [`v2026.11.06.3`](https://github.com/guilleojeda/nodejsonawsbook/releases/tag/v2026.11.06.3) with the final manuscript. It uses Node.js 26 LTS and follows the dedicated-VPC walkthrough. Earlier tags are available for readers using earlier copies of the book.

```bash
git clone https://github.com/guilleojeda/nodejsonawsbook.git
cd nodejsonawsbook
git checkout v2026.11.06.3
```

## Examples and chapter progression

The chapter folders capture different stages of the walkthrough. A local-only listener in Chapter 2 and an environment-configured container listener in later chapters serve different purposes; do not mix their configuration.

| Path | Purpose |
| --- | --- |
| `simple-aws-nodejs-app/` | Runnable, container-ready baseline corresponding to Chapter 4, with local database fallbacks and environment overrides. |
| `CodeByChapters/Chapter2/` | Local setup commands and the initial app, including loopback-only PostgreSQL and HTTP bindings. |
| `CodeByChapters/Chapter3/` | AWS CLI installation commands and the EC2 User Data script. |
| `CodeByChapters/Chapter4/` | Dockerfile, build-context exclusions, and both Compose examples for the working app. |
| `CodeByChapters/Chapter5/` and `CodeByChapters/Chapter6/` | App snapshots that use the database, TLS, and secret settings from the book. Chapter 6 also has the ECS Exec task-role policy. |
| `CodeByChapters/Chapter9/` | CloudFormation S3 creation and versioning examples. |
| `CodeByChapters/Chapter11/` | Teaching examples for the task execution role, including an intentionally insecure policy and its scoped replacement. |
| `CodeByChapters/Chapter12/` | CodeBuild policy and buildspec to use with the account, Region, repository, connection, artifact bucket and secrets configured in the book. |
| `CodeByChapters/Chapter13/` | Runnable tracing and custom-metrics app used by Appendix A, with a non-root image, its own dependency lockfile, and the ADOT collector configuration. |
| `codeSamples/complete-cloudformation-template.yaml` | Appendix A's infrastructure template, bootstrap commands and outputs. |

The chapter snapshots are snippets, not separate npm projects. The baseline and Chapter 13 folders contain complete npm projects. When committing a rebuilt Chapter 13 sample, commit its application, tracing and metrics sources, Dockerfile, package manifests and lockfile, and test scripts together. Follow the book's incremental edits when building the main walkthrough yourself.

## Node.js and dependencies

Node.js 26 LTS is this edition's reference version. Run `nvm use` from the repository root if you use nvm. Both package manifests require Node.js 26 or newer. Use the Node.js 26 examples and images throughout the walkthrough.

The Chapter 2 nvm snippets preserve `NVM_DIR` when set; otherwise they use `$XDG_CONFIG_HOME/nvm` or `$HOME/.nvm`. Installation and loading use the same directory. Keep any custom directory setting consistent across shell sessions.

Use `npm ci` in either runnable app directory to install its recorded dependency tree. Chapter 13 pins the OpenTelemetry packages to the compatible set in the manuscript, disables SDK metric and log exporters, and sends traces to an ADOT Collector. Do not independently update one OpenTelemetry package to a different release family.

Chapter 13 also includes a scoped override from `gcp-metadata@8.1.4` to `gaxios` 7.1.4. It removes an unused transitive filesystem dependency while keeping the OpenTelemetry packages unchanged. Keep the override and its matching lockfile. When recreating the package files from the book's commands, set it before installing the tracing packages:

```bash
npm pkg set --json \
  'overrides={"gcp-metadata@8.1.4":{"gaxios":"7.1.4"}}'
```

For the local Docker examples, use a current Docker Engine, version 28.0.0 or later. Run `docker version` and check the **Server** version if Docker is already installed. Older engines can expose localhost-published ports to other computers on the same local network; see [Docker's port-publishing documentation](https://docs.docker.com/engine/network/port-publishing/). Keep the loopback bindings in the examples.

In Chapter 2, the app runs on your computer, so it connects through a PostgreSQL host port. In Chapter 4, the app and database share a Docker network. Leave the PostgreSQL port unpublished there; the app still uses port 5432 inside the network, and you can run `psql` with `docker compose exec`. Copy the baseline Compose file to your app directory as `docker-compose.yml`. To follow the environment-file variant, copy `docker-compose.env.yml` in its place and use `.env.example` to create a local `.env`.

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

The image needs the public Amazon RDS CA bundle at `certs/global-bundle.pem`. If the application is built from a separate application repository, commit this public bundle there so the Chapter 12 pipeline includes it; it contains no database password or private key. This companion repository intentionally ignores the bundle, so download or copy it into the Chapter 13 build context before a local build. Never replace it with a private key or disable certificate verification. Appendix A's output commands download the bundle into their build directory too.

The Chapter 5 app login can read and insert rows in the table you created, which also has a `created_at` column. If you use that login, replace the entire startup `await pool.query(...)` block inside `initializeDatabase()` in `CodeByChapters/Chapter13/app.js` with this before running `docker build`:

```js
await pool.query('SELECT 1 FROM public.data LIMIT 1');
```

For a fresh Appendix A database, keep the original startup query. The app takes a transaction-scoped PostgreSQL lock before creating the `id`/`value` table, so two starting tasks can safely initialize the same database. Creating the table at startup and using the master database account are learning shortcuts described in Appendix A.

```bash
cd CodeByChapters/Chapter13
mkdir -p certs
curl --fail --show-error --location \
  https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem \
  -o certs/global-bundle.pem
docker build --platform linux/amd64 -t simpleawsnodejsapp .
```

Use the task settings in the book or Appendix A: `DB_HOST`, `DB_USER`, `DB_NAME`, `DB_PASS`, `DB_PORT`, `PGSSLMODE=verify-full`, and `NODE_EXTRA_CA_CERTS=/app/certs/global-bundle.pem`. Supply the password through the configured Secrets Manager reference. The writer hostname must remain the TLS verification target.

Run an ADOT Collector with the app and configure the OTLP endpoint and X-Ray task-role permissions as the book shows. The repository's local smoke check does not establish that traces reached AWS.

The Chapter 13 image starts Node directly with `tracing.js` preloaded, so the Node process receives the container's `SIGTERM` and can flush queued traces before exiting. When adding tracing to the app carried forward from Chapter 4, change its Dockerfile command to `CMD ["node", "-r", "./tracing.js", "app.js"]` too. The package's `npm start` command remains available for local use.

## AWS examples

### Walkthrough networking and ownership

The main walkthrough uses one VPC created manually in Chapter 3, named `SimpleAWS-vpc` with CIDR `10.0.0.0/16`. Enable VPC DNS support and hostnames. Create one public subnet and one private subnet in each of two Availability Zones:

| Subnet | Name tag | CIDR | Use |
| --- | --- | --- | --- |
| Public 1 | `SimpleAWS-subnet-public1-<AZ>` | `10.0.0.0/24` | ALB, ECS tasks, and temporary database administration host |
| Public 2 | `SimpleAWS-subnet-public2-<AZ>` | `10.0.1.0/24` | ALB and ECS tasks |
| Private 1 | `SimpleAWS-subnet-private1-<AZ>` | `10.0.16.0/20` | Aurora database subnet group |
| Private 2 | `SimpleAWS-subnet-private2-<AZ>` | `10.0.32.0/20` | Aurora database subnet group |

Public subnets route through an Internet Gateway. Assign a public IPv4 address when launching the temporary EC2 administration host and enable public IP assignment for ECS tasks. Private subnets are isolated, with no NAT gateway or internet route. Create Aurora's database subnet group `simpleaws-db-subnets` from both private subnets and disable public access. Record the VPC and subnet IDs with their names and AZs, then verify those details when selecting the network throughout Chapters 5 and 6; do not use the account's default VPC. The public-task path does not require a NAT gateway or S3 endpoint.

Appendix A is separate: its CloudFormation template creates and owns another VPC, subnets and workloads. The template tags the VPC and subnets with the stack name and `appendix` so they are easy to distinguish from the manual Chapter 3 network. Deleting the Appendix A stack removes its network; handle the retained database snapshot and KMS key as the appendix directs. The manual VPC is outside that stack. After deleting its ECS service and tasks, ALB, any EC2 hosts, Aurora cluster and DB subnet group, and allowing service-managed network interfaces to clear, use the VPC console's Delete VPC workflow. Review the remaining network components it will delete. Verify the recorded VPC/subnet IDs, names and AZs before cleanup so unrelated or default networks are left alone.

The Chapter 3 installer snippets include post-install shell setup. On Linux and macOS, the current-user AWS CLI installer puts its executable in `${XDG_BIN_HOME:-$HOME/.local/bin}`. Add that directory to the current shell's `PATH` and keep the setting in the appropriate shell startup file, as the snippets explain. If you chose a custom `XDG_BIN_HOME`, preserve that setting before the `PATH` line too. On Windows, close and reopen the terminal after installation before checking the version. Confirm which executable runs and that `aws --version` starts with `aws-cli/2` before configuring credentials.

Replace every named placeholder in the IAM policies and buildspec with the resources created for your walkthrough. CloudWatch log-group names are case-sensitive. Use the exact log-group ARN; where the policy appends `:log-stream:*`, start from the ARN without a trailing `:*`. For `YOUR_DOCKERHUB_SECRET_ARN`, use the full Secrets Manager ARN, including its generated suffix. Keep the database-secret read grant alongside the scoped task execution policy.

The first Chapter 11 policy is deliberately broad so the book can explain the correction. Use the scoped replacement for the completed walkthrough. Never put AWS credentials, database passwords or Docker Hub tokens into these files, an image or Git.

For Appendix A, create the stack with `ServiceDesiredCount=0`, acknowledge its IAM resources, and run the generated image-push commands from `CodeByChapters/Chapter13`. Then update `ImageTag` to the pushed tag and `ServiceDesiredCount` to `2`. Wait for the two targets to become healthy, then check `/health` and POST and GET `/data` through the stack's `ECSALBDNSName` output. Follow the appendix's cleanup instructions for the stack and anything you retain, such as the KMS key.

## Errata and edition notes

Use this repository's Issues tab for corrections and errata. Release `v2026.11.06.3` adds downloadable walkthrough examples, serializes first-start database initialization, scopes CodeBuild to the exact Docker Hub secret, and uses the ECS service-linked role for scaling.

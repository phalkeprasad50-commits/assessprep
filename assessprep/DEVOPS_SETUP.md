# AssessPrep DevOps kit — setup

Copy these files into the **root of your AssessPrep repo** (next to `pom.xml`).

## 1. Three small changes to your existing code

1. **pom.xml**: add the two dependencies from `snippets/pom-additions.xml` (Actuator and the Prometheus registry).
2. **application.yml**: add the `management:` block from `snippets/application-yml-additions.yml`.
3. **Security config**: allow the actuator endpoints, see `snippets/SecurityConfig-additions.java.txt`.
   Without this, Spring Security returns 401 and Prometheus cannot scrape the app.

Then check that it still builds: `mvn -B verify`

## 2. Run the whole stack

```bash
cp .env.example .env          # then edit the values; generate a secret with: openssl rand -base64 48
docker compose up -d --build
./scripts/check.sh            # all four lines should say OK
```

| What | URL |
|---|---|
| App | http://localhost:8080 |
| Health | http://localhost:8080/actuator/health |
| Prometheus | http://localhost:9090 (Status > Targets: assessprep should be UP) |
| Grafana | http://localhost:3000 (user `admin`, password from `.env`) |

The dashboard "AssessPrep Overview" is provisioned automatically.

## 3. Make the dashboard move

Generate some traffic, including some errors:

```bash
for i in $(seq 1 200); do
  curl -s -o /dev/null http://localhost:8080/actuator/health
  curl -s -o /dev/null http://localhost:8080/does-not-exist
done
```

## 4. CI pipeline

Push to GitHub. `.github/workflows/ci.yml` runs on every push and pull request:
1. **build-test**: Maven build and tests against a PostgreSQL service container.
2. **docker**: builds the image, scans it with Trivy (fails on CRITICAL), and on `main` pushes it to GitHub Container Registry tagged with the commit SHA.

## 5. If something fails

| Symptom | Check |
|---|---|
| App container restarts | `docker compose logs app`, usually DB credentials or the JWT secret length (32+ bytes) |
| Prometheus target DOWN | Security config not updated (401), or the actuator dependency is missing |
| Grafana panels empty | Wait 30 seconds, generate traffic, check Prometheus Targets |
| CI tests fail on database | Your tests may need extra env vars, see `env:` in the workflow |
| Trivy fails the build | Read the report; update the base image or dependency, do not just disable the scan |

## 6. What to explain in the interview

- Why multi-stage and non-root in the Dockerfile.
- Why `depends_on` uses a health check.
- What each stage of the pipeline does and why the scan runs before the push.
- How Prometheus scrapes `/actuator/prometheus` and what each dashboard panel measures (traffic, errors, latency, saturation).
- What each alert means and why it waits (`for: 5m`) before firing.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const backendDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = resolve(backendDir, "..");
const envModule = pathToFileURL(resolve(backendDir, "src/config/env.js")).href;
const requiredVariables = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "ACCESS_TOKEN_EXPIRES_IN",
  "REFRESH_TOKEN_EXPIRES_IN",
];

function runEnvImport(environment) {
  return spawnSync(
    process.execPath,
    ["--input-type=module", "-e", `import ${JSON.stringify(envModule)};`],
    { cwd: repoDir, env: environment, encoding: "utf8" }
  );
}

describe("environment configuration", () => {
  it("accepts host-provided values when started outside the backend directory", () => {
    const result = runEnvImport({
      ...process.env,
      NODE_ENV: "production",
      PORT: "8123",
      BCRYPT_ROUNDS: "12",
      MONGODB_URI: "mongodb://127.0.0.1:27017/homico_test",
      CLIENT_ORIGIN: "https://homico.example",
      JWT_ACCESS_SECRET: "test_access_secret_012345678901234567890123",
      JWT_REFRESH_SECRET: "test_refresh_secret_012345678901234567890123",
      ACCESS_TOKEN_EXPIRES_IN: "15m",
      REFRESH_TOKEN_EXPIRES_IN: "7d",
    });

    assert.equal(result.status, 0, result.stderr);
  });

  it("rejects zero-length JWT expiry values", () => {
    const result = runEnvImport({
      ...process.env,
      NODE_ENV: "test",
      PORT: "8000",
      BCRYPT_ROUNDS: "12",
      MONGODB_URI: "mongodb://127.0.0.1:27017/homico_test",
      CLIENT_ORIGIN: "http://localhost:5173",
      JWT_ACCESS_SECRET: "test_access_secret_012345678901234567890123",
      JWT_REFRESH_SECRET: "test_refresh_secret_012345678901234567890123",
      ACCESS_TOKEN_EXPIRES_IN: "0s",
      REFRESH_TOKEN_EXPIRES_IN: "7d",
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /ACCESS_TOKEN_EXPIRES_IN/);
  });

  it("requires an explicit CORS origin in production", () => {
    const environment = {
      ...process.env,
      NODE_ENV: "production",
      PORT: "8000",
      BCRYPT_ROUNDS: "12",
      MONGODB_URI: "mongodb://127.0.0.1:27017/homico_test",
      JWT_ACCESS_SECRET: "test_access_secret_012345678901234567890123",
      JWT_REFRESH_SECRET: "test_refresh_secret_012345678901234567890123",
      ACCESS_TOKEN_EXPIRES_IN: "15m",
      REFRESH_TOKEN_EXPIRES_IN: "7d",
    };
    environment.CLIENT_ORIGIN = "";

    const result = runEnvImport(environment);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /CLIENT_ORIGIN/);
  });

  it("rejects example secrets instead of treating them as credentials", () => {
    const result = runEnvImport({
      ...process.env,
      NODE_ENV: "test",
      PORT: "8000",
      BCRYPT_ROUNDS: "12",
      MONGODB_URI: "mongodb://127.0.0.1:27017/homico_test",
      CLIENT_ORIGIN: "http://localhost:5173",
      JWT_ACCESS_SECRET: "replace_with_a_unique_random_access_secret_at_least_32_chars",
      JWT_REFRESH_SECRET: "test_refresh_secret_012345678901234567890123",
      ACCESS_TOKEN_EXPIRES_IN: "15m",
      REFRESH_TOKEN_EXPIRES_IN: "7d",
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /JWT_ACCESS_SECRET/);
  });

  it(
    "reports missing required environment variable names",
    { skip: existsSync(resolve(backendDir, ".env")) },
    () => {
      const environment = {
        ...process.env,
        NODE_ENV: "test",
        PORT: "8000",
        BCRYPT_ROUNDS: "12",
      };
      for (const variable of [
        ...requiredVariables,
        "CLIENT_ORIGIN",
      ]) {
        delete environment[variable];
      }

      const result = runEnvImport(environment);
      assert.equal(result.status, 1);
      for (const variable of requiredVariables) {
        assert.match(result.stderr, new RegExp(variable));
      }
    }
  );
});

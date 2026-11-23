import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";

const keys = ["TENANT0_SESSION_SECRET", "SWITCHBACK_SSO_SECRET"];
const contents = keys.map((key) => `${key}=${randomBytes(32).toString("hex")}`).join("\n");

try {
  writeFileSync(".env.local", contents + "\n", { flag: "wx", mode: 0o600 });
  console.log("Created .env.local with demo signing keys.");
} catch (error) {
  if (error.code !== "EEXIST") throw error;
  console.log("Using existing .env.local. Check that both demo signing keys are set.");
}

/**
 * Moltbook Agent Registration Script
 *
 * Registers a new agent on Moltbook and saves credentials to .envrc.private
 *
 * Usage:
 *   bun run src/register.ts --name "AgentName" --description "What this agent does"
 */

import { parseArgs } from "util";
import { writeFile, readFile, access } from "fs/promises";
import { join } from "path";

const MOLTBOOK_API_BASE = "https://www.moltbook.com/api/v1";

interface RegisterResponse {
  agent: {
    api_key: string;
    claim_url: string;
    verification_code: string;
  };
  important: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  hint?: string;
}

function printUsage(): void {
  console.log(`
Moltbook Agent Registration

Usage:
  bun run src/register.ts --name <agent-name> --description <description>

Options:
  --name, -n         Agent name (required)
  --description, -d  Agent description (required)
  --help, -h         Show this help

Example:
  bun run src/register.ts --name "MyAgent" --description "A helpful assistant"
`);
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function saveCredentials(
  apiKey: string,
  agentName: string,
  claimUrl: string,
  verificationCode: string
): Promise<void> {
  const envrcPrivatePath = join(process.cwd(), ".envrc.private");

  let existingContent = "";
  if (await fileExists(envrcPrivatePath)) {
    existingContent = await readFile(envrcPrivatePath, "utf-8");
    // Remove existing MOLTBOOK entries if present
    existingContent = existingContent
      .split("\n")
      .filter((line) => !line.startsWith("export MOLTBOOK_"))
      .join("\n")
      .trim();
    if (existingContent) {
      existingContent += "\n\n";
    }
  }

  const newContent = `${existingContent}# Moltbook credentials (registered: ${new Date().toISOString()})
export MOLTBOOK_API_KEY="${apiKey}"
export MOLTBOOK_AGENT_NAME="${agentName}"
# Claim URL: ${claimUrl}
# Verification Code: ${verificationCode}
`;

  await writeFile(envrcPrivatePath, newContent, "utf-8");
  console.log(`Credentials saved to: ${envrcPrivatePath}`);
}

async function registerAgent(
  name: string,
  description: string
): Promise<void> {
  console.log(`Registering agent "${name}"...`);

  const response = await fetch(`${MOLTBOOK_API_BASE}/agents/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, description }),
  });

  const data = (await response.json()) as RegisterResponse | ErrorResponse;

  if (!response.ok || "error" in data) {
    const errorData = data as ErrorResponse;
    console.error(`Registration failed: ${errorData.error}`);
    if (errorData.hint) {
      console.error(`Hint: ${errorData.hint}`);
    }
    process.exit(1);
  }

  const successData = data as RegisterResponse;
  const { api_key, claim_url, verification_code } = successData.agent;

  console.log("\n=== Registration Successful ===\n");
  console.log(`Agent Name: ${name}`);
  console.log(`API Key: ${api_key}`);
  console.log(`Verification Code: ${verification_code}`);
  console.log(`\nClaim URL: ${claim_url}`);
  console.log("\n=== IMPORTANT ===");
  console.log("1. Share the claim URL with your human to verify ownership");
  console.log("2. They need to post a verification tweet");
  console.log("3. Run 'direnv allow' to load the new credentials");

  await saveCredentials(api_key, name, claim_url, verification_code);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      name: { type: "string", short: "n" },
      description: { type: "string", short: "d" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
    allowPositionals: false,
  });

  if (values.help) {
    printUsage();
    process.exit(0);
  }

  if (!values.name || !values.description) {
    console.error("Error: --name and --description are required\n");
    printUsage();
    process.exit(1);
  }

  await registerAgent(values.name, values.description);
}

main().catch((error: unknown) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});

/**
 * Moltbook Posting Script
 *
 * Create posts on Moltbook as a human (not AI agent)
 *
 * Usage:
 *   bun run src/post.ts --submolt general --title "Hello" --content "My post content"
 *   bun run src/post.ts --submolt general --title "Link Post" --url "https://example.com"
 *
 * Environment:
 *   MOLTBOOK_API_KEY - Your Moltbook API key (required)
 */

import { parseArgs } from "util";

const MOLTBOOK_API_BASE = "https://www.moltbook.com/api/v1";

interface PostResponse {
  success: true;
  post: {
    id: string;
    title: string;
    content?: string;
    url?: string;
    submolt: {
      id: string;
      name: string;
      display_name: string;
    };
    created_at: string;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  hint?: string;
  retry_after_minutes?: number;
}

function printUsage(): void {
  console.log(`
Moltbook Post Creator

Usage:
  bun run src/post.ts --submolt <submolt> --title <title> [--content <content>] [--url <url>]

Options:
  --submolt, -s      Submolt/community name (required)
  --title, -t        Post title (required)
  --content, -c      Post content (for text posts)
  --url, -u          URL (for link posts)
  --help, -h         Show this help

Environment:
  MOLTBOOK_API_KEY   Your API key (required)

Examples:
  # Text post
  bun run src/post.ts -s general -t "Hello Moltbook" -c "My first post!"

  # Link post
  bun run src/post.ts -s general -t "Interesting article" -u "https://example.com"
`);
}

function getApiKey(): string {
  const apiKey = process.env["MOLTBOOK_API_KEY"];
  if (!apiKey) {
    console.error("Error: MOLTBOOK_API_KEY environment variable is not set");
    console.error("Run 'direnv allow' or set the variable manually");
    process.exit(1);
  }
  return apiKey;
}

async function createPost(
  apiKey: string,
  submolt: string,
  title: string,
  content?: string,
  url?: string
): Promise<void> {
  console.log(`Creating post in m/${submolt}...`);

  const body: { submolt: string; title: string; content?: string; url?: string } = {
    submolt,
    title,
  };
  if (content) body.content = content;
  if (url) body.url = url;

  const response = await fetch(`${MOLTBOOK_API_BASE}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as PostResponse | ErrorResponse;

  if (!response.ok || "error" in data) {
    const errorData = data as ErrorResponse;
    console.error(`Post failed: ${errorData.error}`);
    if (errorData.hint) {
      console.error(`Hint: ${errorData.hint}`);
    }
    if (errorData.retry_after_minutes) {
      console.error(
        `Rate limited. Retry after ${errorData.retry_after_minutes} minutes.`
      );
    }
    process.exit(1);
  }

  const successData = data as PostResponse;
  console.log("\n=== Post Created ===\n");
  console.log(`Post ID: ${successData.post.id}`);
  console.log(`Title: ${successData.post.title}`);
  console.log(`Submolt: m/${submolt}`);
  console.log(`URL: https://www.moltbook.com/post/${successData.post.id}`);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      submolt: { type: "string", short: "s" },
      title: { type: "string", short: "t" },
      content: { type: "string", short: "c" },
      url: { type: "string", short: "u" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
    allowPositionals: false,
  });

  if (values.help) {
    printUsage();
    process.exit(0);
  }

  if (!values.submolt || !values.title) {
    console.error("Error: --submolt and --title are required\n");
    printUsage();
    process.exit(1);
  }

  if (!values.content && !values.url) {
    console.error("Error: Either --content or --url is required\n");
    printUsage();
    process.exit(1);
  }

  const apiKey = getApiKey();
  await createPost(
    apiKey,
    values.submolt,
    values.title,
    values.content,
    values.url
  );
}

main().catch((error: unknown) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});

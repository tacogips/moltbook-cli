# Moltbook Poster

A CLI client for interacting with the Moltbook social platform. This tool enables agent registration and content posting to Moltbook communities (submolts).

## Features

- **Agent Registration**: Register a new agent on Moltbook and automatically save API credentials
- **Post Creation**: Create text posts or link posts in Moltbook communities (submolts)

## Architecture

### Agent Registration Flow

```mermaid
sequenceDiagram
    participant CLI as moltbook-poster
    participant API as Moltbook API
    participant File as .envrc.private
    participant Human as Human User

    CLI->>API: POST /api/v1/agents/register
    Note over CLI,API: {name, description}
    API-->>CLI: 200 OK
    Note over API,CLI: {api_key, claim_url, verification_code}
    CLI->>File: Save credentials
    Note over File: MOLTBOOK_API_KEY<br/>MOLTBOOK_AGENT_NAME
    CLI-->>Human: Display claim_url & verification_code
    Human->>API: Visit claim_url
    Human->>API: Post verification tweet
    API-->>Human: Agent ownership verified
```

### Post Creation Flow

```mermaid
sequenceDiagram
    participant Env as Environment
    participant CLI as moltbook-poster
    participant API as Moltbook API

    CLI->>Env: Read MOLTBOOK_API_KEY
    Env-->>CLI: api_key
    CLI->>API: POST /api/v1/posts
    Note over CLI,API: Authorization: Bearer {api_key}<br/>{submolt, title, content/url}
    alt Success
        API-->>CLI: 200 OK
        Note over API,CLI: {post_id, title, submolt, created_at}
        CLI-->>CLI: Display post URL
    else Rate Limited
        API-->>CLI: 429 Too Many Requests
        Note over API,CLI: {error, retry_after_minutes}
        CLI-->>CLI: Display retry message
    else Error
        API-->>CLI: 4xx/5xx Error
        Note over API,CLI: {error, hint}
        CLI-->>CLI: Display error message
    end
```

## Requirements

- [Bun](https://bun.sh/) runtime
- [direnv](https://direnv.net/) (optional, for automatic environment loading)
- Nix with flakes (optional, for reproducible development environment)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd moltbook-poster

# Install dependencies
bun install
```

## Usage

### Register an Agent

Register a new agent on Moltbook to obtain API credentials:

```bash
bun run register --name "AgentName" --description "What this agent does"
```

Options:

- `--name, -n`: Agent name (required)
- `--description, -d`: Agent description (required)
- `--help, -h`: Show help

After registration:

1. Credentials are saved to `.envrc.private`
2. Share the claim URL with your human for ownership verification
3. Run `direnv allow` to load the new credentials

### Create a Post

Create posts in Moltbook communities:

```bash
# Text post
bun run post --submolt general --title "Hello Moltbook" --content "My first post!"

# Link post
bun run post --submolt general --title "Interesting article" --url "https://example.com"
```

Options:

- `--submolt, -s`: Submolt/community name (required)
- `--title, -t`: Post title (required)
- `--content, -c`: Post content (for text posts)
- `--url, -u`: URL (for link posts)
- `--help, -h`: Show help

Environment variables:

- `MOLTBOOK_API_KEY`: Your Moltbook API key (required)

## Development

```bash
# Run in development mode with hot reload
bun run dev

# Run tests
bun run test

# Type check
bun run typecheck

# Format code
bun run format
```

## Project Structure

```
.
├── src/
│   ├── register.ts   # Agent registration script
│   ├── post.ts       # Post creation script
│   ├── lib.ts        # Library utilities
│   └── main.ts       # Entry point
├── package.json
├── tsconfig.json
└── flake.nix         # Nix development environment
```

## License

MIT

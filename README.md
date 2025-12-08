# GitLab Docs MCP Server

A Model Context Protocol server that provides AI assistants instant access to GitLab's official documentation.

## Installation

This server works with any MCP-compatible AI assistant including GitHub Copilot, Claude Desktop, Docker Desktop, and other MCP clients.

### GitHub Copilot (VS Code)

**1. Open VS Code Settings** (<kbd>⌘</kbd>+<kbd>,</kbd> or <kbd>Ctrl</kbd>+<kbd>,</kbd>)

**2. Add to `settings.json`:**

```json
{
  "github.copilot.chat.mcp.servers": {
    "gitlab-docs": {
      "command": "npx",
      "args": ["-y", "gitlab-docs-mcp"]
    }
  }
}
```

**3. Restart VS Code**

### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gitlab-docs": {
      "command": "npx",
      "args": ["-y", "gitlab-docs-mcp"]
    }
  }
}
```

Restart Claude Desktop.

### Other MCP Clients

For other MCP-compatible clients, use:
```bash
npx -y gitlab-docs-mcp
```

## Usage

Ask your AI assistant about GitLab documentation:

```
Search GitLab docs for CI/CD pipeline configuration
Show me GitLab Runner installation steps
How do I configure GitLab authentication?
Explain GitLab API rate limits
Search GitLab docs for GraphQL mutations to update issues
Find GitLab GraphQL query examples for project data
```

## Available Tools

### `searchGitLabDocs`
Search across 2,494 GitLab documentation pages with intelligent ranking.

**Parameters:**
- `query` - Search terms
- `maxResults` - Maximum results (default: 10, max: 50)
- `section` - Filter by section: ci, api, user, admin, development

### `getDocPage`
Retrieve the complete content of a specific documentation page.

**Parameters:**
- `path` - Document path (e.g., "ci/yaml/README.md")

### `listDocSections`
Browse available documentation sections and their structure.

## Troubleshooting

**Server not responding?**
- Ensure Node.js 18+ is installed: `node --version`
- Restart your AI assistant/client completely
- Check application logs for MCP connection errors

**Need to update documentation?**
The server uses a pre-built index. For the latest GitLab docs, rebuild from source:
```bash
git clone <repository-url>
cd gitlab-docs-mcp
npm install
npm run build-index
npm run build
```

Then update your MCP client configuration to use the local build:

**GitHub Copilot:**
```json
{
  "github.copilot.chat.mcp.servers": {
    "gitlab-docs": {
      "command": "node",
      "args": ["/absolute/path/to/gitlab-docs-mcp/dist/index.js"]
    }
  }
}
```

**Claude Desktop:**
```json
{
  "mcpServers": {
    "gitlab-docs": {
      "command": "node",
      "args": ["/absolute/path/to/gitlab-docs-mcp/dist/index.js"]
    }
  }
}
```

## License

MIT

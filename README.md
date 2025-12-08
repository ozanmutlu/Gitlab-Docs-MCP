# GitLab Docs MCP Server

[![npm version](https://badge.fury.io/js/gitlab-docs-mcp.svg)](https://www.npmjs.com/package/gitlab-docs-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A [Model Context Protocol](https://modelcontextprotocol.io) server that provides AI assistants instant access to GitLab's official documentation.

## Features

- **Intelligent Search** - Fast, relevance-ranked search across all docs
- **Section Filtering** - Target specific areas (CI/CD, API, Admin, etc.)
- **Full Content Access** - Retrieve complete documentation pages
- **Always Up-to-Date** - Automatically synced with latest GitLab docs
- **Universal Compatibility** - Works with any MCP-compatible AI assistant

## Installation

This server works with any MCP-compatible AI assistant. The [Model Context Protocol](https://modelcontextprotocol.io) allows AI assistants to connect to external tools and data sources through a standardized interface.

### GitHub Copilot (VS Code)

**1. Open MCP Configuration**

Press <kbd>⌘</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> (or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> on Windows/Linux), type `MCP: Open User Configuration`, and press Enter.

**2. Add to `mcp.json`:**

```json
{
  "servers": {
    "gitlab-docs": {
      "command": "npx",
      "args": ["-y", "gitlab-docs-mcp"]
    }
  }
}
```

**3. Reload VS Code**

Press <kbd>⌘</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> (or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>), type `Developer: Reload Window`, and press Enter.

**Alternative:** You can also manually create/edit the file at:
- **macOS:** `~/Library/Application Support/Code/User/mcp.json`
- **Windows:** `%APPDATA%\Code\User\mcp.json`
- **Linux:** `~/.config/Code/User/mcp.json`

### Claude Desktop

Claude Desktop is a standalone desktop application by Anthropic that supports MCP servers.

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

### Cursor IDE

Cursor has built-in MCP support. Create or edit the MCP configuration file:

**1. Create/Edit Configuration File**

- **Project-specific:** `.cursor/mcp.json` in your project root
- **Global:** `~/.cursor/mcp.json` in your home directory

**2. Add Server Configuration:**

```json
{
  "servers": {
    "gitlab-docs": {
      "command": "npx",
      "args": ["-y", "gitlab-docs-mcp"]
    }
  }
}
```

**3. Restart Cursor**

### Other MCP Clients

For other MCP-compatible clients (Zed, Windsurf, etc.), configure them to run:
```bash
npx -y gitlab-docs-mcp
```

Refer to your client's MCP configuration documentation for the specific format required.

## Usage

Once configured, simply ask your AI assistant about GitLab:

**Example Conversations:**

```
You: "How do I set up a CI/CD pipeline in GitLab?"
Assistant: [Searches GitLab docs and provides detailed pipeline configuration guide]

You: "Show me how to configure GitLab Runner on Ubuntu"
Assistant: [Retrieves GitLab Runner installation documentation]

You: "What are the GraphQL mutations for updating issues?"
Assistant: [Searches API docs and shows GraphQL mutation examples]

You: "Explain GitLab's authentication options"
Assistant: [Provides overview from authentication documentation]
```

The AI assistant will automatically use the GitLab Docs MCP server to search documentation and provide accurate, up-to-date answers.

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
- Ensure Node.js 22+ is installed: `node --version`
- Restart your AI assistant/client completely
- Check application logs for MCP connection errors

**Documentation out of date?**
The server automatically uses the latest published version from npm. Simply restart your MCP client to get updates.

## Contributing

Found a bug or have a feature request? Please visit the [GitHub repository](https://github.com/ozanmutlu/Gitlab-Docs-MCP).

## License

MIT - see [LICENSE](LICENSE) file for details.

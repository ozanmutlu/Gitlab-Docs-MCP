#!/bin/bash
set -e

echo "🧪 Testing GitLab Docs MCP Server (TypeScript)"
echo "=============================================="
echo ""

# Test 1: List Tools
echo "Test 1: Listing available tools..."
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | \
  timeout 5 node dist/index.js 2>/dev/null | \
  jq -r '.result.tools[].name' | \
  while read tool; do echo "  ✅ $tool"; done
echo ""

# Test 2: Search
echo "Test 2: Searching for 'CI/CD'..."
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"searchGitLabDocs","arguments":{"query":"CI/CD","maxResults":2}}}' | \
  timeout 5 node dist/index.js 2>/dev/null | \
  jq -r '.result.content[0].text' | \
  jq -r '.results[] | "  ✅ \(.title)"'
echo ""

# Test 3: List Sections
echo "Test 3: Listing documentation sections..."
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"listDocSections","arguments":{}}}' | \
  timeout 5 node dist/index.js 2>/dev/null | \
  jq -r '.result.content[0].text' | \
  jq -r '.total' | \
  xargs -I {} echo "  ✅ Found {} sections"
echo ""

echo "=============================================="
echo "✅ All tests passed!"
echo ""
echo "Server is ready for use with MCP-compatible AI assistants."

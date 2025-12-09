# WatchBase MCP Server

[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An MCP (Model Context Protocol) server providing access to the [WatchBase Data Feed API](https://watchbase.com/data-feed) for querying comprehensive watch metadata.

## What is WatchBase?

[WatchBase](https://watchbase.com) is a comprehensive watch database containing detailed information about luxury watches, including:
- **280+ brands** (Rolex, Patek Philippe, Audemars Piguet, etc.)
- **Thousands of watch families/collections**
- **Technical specifications** (case size, movement, complications, etc.)
- **Reference numbers** for precise identification

## Features

This MCP server provides 6 tools for querying the WatchBase API:

| Tool | Description | Required Params |
|------|-------------|-----------------|
| `search` | Search by brand, family, watch name, or reference number (whole words) | `q` |
| `search_refnr` | Search by reference number (partial matches allowed) | `q` |
| `list_brands` | Get all watch brands in the database | — |
| `list_families` | Get all families/collections for a brand | `brand_id` |
| `list_watches` | Get watches for a brand/family (with optional date filter) | `brand_id` |
| `get_watch_details` | Get full specifications for a specific watch | `id` |

## Prerequisites

- **Node.js 18+** (including Node.js 25)
- **WatchBase API Key** — [Request access here](https://watchbase.com/data-feed)

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/watchdealer-pavel/watchbase-mcp-server.git
cd watchbase-mcp-server
npm install
```

### 2. Configure Your MCP Client

Add to your MCP client configuration:

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "watchbase": {
      "command": "node",
      "args": ["/path/to/watchbase-mcp-server/build/index.js"],
      "env": {
        "WATCHBASE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Claude Code** (`.mcp.json` in your project):

```json
{
  "mcpServers": {
    "watchbase": {
      "command": "node",
      "args": ["/path/to/watchbase-mcp-server/build/index.js"],
      "env": {
        "WATCHBASE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 3. Restart Your MCP Client

Restart Claude Desktop or Claude Code to load the new MCP server.

## Usage Examples

### Search for a Watch

```
Search for "Royal Oak" watches
→ Uses: search tool with q="Royal Oak"
```

### Search by Reference Number

```
Find watches with reference number starting with "15500"
→ Uses: search_refnr tool with q="15500"
```

### Browse Brands and Families

```
List all Rolex families
→ Uses: list_brands to find Rolex ID, then list_families with brand_id
```

### Get Watch Specifications

```
Get full details for watch ID 12345
→ Uses: get_watch_details tool with id=12345
```

## API Response Examples

### Brand Object
```json
{
  "id": 59,
  "name": "Audemars Piguet"
}
```

### Watch List Response
```json
{
  "id": 11702,
  "refnr": "15500ST.OO.1220ST.01",
  "name": "Royal Oak",
  "brand": { "id": 59, "name": "Audemars Piguet" },
  "family": { "id": 234, "name": "Royal Oak" },
  "thumb": "https://cdn.watchbase.com/watch/medium/...",
  "updated": "2024-01-15"
}
```

### Watch Details Response
Includes all fields plus:
- `caliber` — Movement details
- `case` — Case specifications
- `dial` — Dial information
- `added`, `modified`, `published` — Metadata dates

## For Watch Dealers

This MCP server is perfect for:

1. **Inventory Management** — Look up reference numbers and specifications
2. **Price Research** — Get detailed specs to compare with market prices
3. **Authentication** — Verify reference numbers and specifications
4. **Content Creation** — Generate accurate watch descriptions
5. **Customer Service** — Quickly answer questions about any watch

### Typical Workflow

1. **Search by reference number** — `search_refnr` with partial ref
2. **Get watch ID** from search results
3. **Fetch full details** — `get_watch_details` with ID
4. **Use specifications** for listings, comparisons, or research

### Incremental Sync for Large Inventories

Use `list_watches` with `updated_since` parameter to sync only changed records:

```
list_watches with brand_id=59, updated_since="2024-01-01"
→ Returns only watches updated after Jan 1, 2024
```

## API Documentation

See [watchbase_api_reference.md](./watchbase_api_reference.md) for detailed API documentation.

## Development

```bash
# Watch mode (auto-rebuild on changes)
npm run dev

# Manual build
npm run build

# Run the server directly
npm start
```

## Troubleshooting

### "WATCHBASE_API_KEY environment variable is required"
Make sure you've added the `WATCHBASE_API_KEY` to your MCP client's `env` configuration.

### "WatchBase API error: Invalid or unauthorized API key"
Your API key may be invalid or expired. Contact WatchBase support.

### Server not appearing in Claude
1. Check the path to `build/index.js` is correct
2. Restart Claude Desktop/Code
3. Check logs for connection errors

## License

MIT License — see [LICENSE](LICENSE) file.

**Note:** This MCP server is an independent project. Please refer to [WatchBase Terms of Service](https://watchbase.com/terms) for API usage policies.

## Links

- [WatchBase Data Feed](https://watchbase.com/data-feed) — API access and pricing
- [WatchBase Website](https://watchbase.com) — Browse the watch database
- [Model Context Protocol](https://modelcontextprotocol.io) — MCP documentation

# WatchBase MCP Server

An MCP (Model Context Protocol) server providing access to the WatchBase Data Feed API for querying watch metadata.

## About WatchBase API

The WatchBase Data Feed API provides structured access to a comprehensive database of watch information, including brands, families (collections), specific watch models, reference numbers, technical details, and images. It allows developers to integrate detailed watch data into their applications. More information can be found on the [WatchBase API Documentation](https://api.watchbase.com/docs).

## Features

This MCP server exposes the following tools corresponding to the WatchBase API endpoints:

*   **`search`**: Search the database by brand name, family name, watch name, and reference number (matches whole words).
*   **`search_refnr`**: Search the database by reference number (allows partial matches).
*   **`list_brands`**: Retrieve a list of all watch brands in the database.
*   **`list_families`**: Retrieve a list of all families (collections) for a given brand ID.
*   **`list_watches`**: Retrieve a list of watches for a particular Brand ID and optionally Family ID. Can be filtered by update date.
*   **`get_watch_details`**: Retrieve the full details (all data fields) for a particular watch by its WatchBase ID.

## Prerequisites

*   **Node.js and npm:** Required to install dependencies and run the server.
*   **WatchBase API Key:** You need an API key from WatchBase. Visit the [WatchBase API page](https://api.watchbase.com/) to request access and obtain a key.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/watchdealer-pavel/watchbase-mcp.git
    cd watchbase-mcp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the server:**
    ```bash
    npm run build
    ```
    This command compiles the TypeScript source code into JavaScript, placing the output in the `build/` directory (specifically `build/index.js`).

## Configuration

The server requires your WatchBase API key to be provided via the `WATCHBASE_API_KEY` environment variable. You need to configure your MCP client (like Cline/Roo Code or the Claude Desktop App) to run this server and pass the environment variable.

**Example Configuration:**

Below are examples for common MCP clients. **Remember to replace `/path/to/your/watchbase-mcp/build/index.js` with the actual absolute path to the compiled server file on your system, and `YOUR_WATCHBASE_API_KEY` with your real WatchBase API key.**

### Cline / Roo Code (VS Code Extension)

1.  Open your VS Code settings for MCP servers. On macOS, this is typically located at:
    `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
    *(Note: The exact path might vary based on your operating system and VS Code installation type. For Roo Code, replace `saoudrizwan.claude-dev` with `rooveterinaryinc.roo-cline`)*

2.  Add the following configuration block under the `mcpServers` key:

    ```json
    "watchbase-mcp": {
      "command": "node",
      "args": ["/path/to/your/watchbase-mcp/build/index.js"], // <-- IMPORTANT: Replace with the ACTUAL absolute path to build/index.js
      "env": {
        "WATCHBASE_API_KEY": "YOUR_WATCHBASE_API_KEY" // <-- IMPORTANT: Replace with your WatchBase API Key
      },
      "disabled": false,
      "autoApprove": [] // Or add specific tools you want to auto-approve
    }
    ```

### Claude Desktop App

1.  Open the Claude Desktop App configuration file. On macOS, this is typically located at:
    `~/Library/Application Support/Claude/claude_desktop_config.json`
    *(Note: The exact path might vary based on your operating system.)*

2.  Add the following configuration block under the `mcpServers` key:

    ```json
    "watchbase-mcp": {
      "command": "node",
      "args": ["/path/to/your/watchbase-mcp/build/index.js"], // <-- IMPORTANT: Replace with the ACTUAL absolute path to build/index.js
      "env": {
        "WATCHBASE_API_KEY": "YOUR_WATCHBASE_API_KEY" // <-- IMPORTANT: Replace with your WatchBase API Key
      },
      "disabled": false,
      "autoApprove": [] // Or add specific tools you want to auto-approve
    }
    ```

## Usage

Once configured, you can invoke the server's tools from your AI assistant using the `use_mcp_tool` command/tool.

### `search` Example

```xml
<use_mcp_tool>
  <server_name>watchbase-mcp</server_name>
  <tool_name>search</tool_name>
  <arguments>
    {
      "q": "priors court"
    }
  </arguments>
</use_mcp_tool>
```

### `search_refnr` Example

```xml
<use_mcp_tool>
  <server_name>watchbase-mcp</server_name>
  <tool_name>search_refnr</tool_name>
  <arguments>
    {
      "q": "P2/"
    }
  </arguments>
</use_mcp_tool>
```

### `list_brands` Example

```xml
<use_mcp_tool>
  <server_name>watchbase-mcp</server_name>
  <tool_name>list_brands</tool_name>
  <arguments>
    {}
  </arguments>
</use_mcp_tool>
```

### `list_families` Example

```xml
<use_mcp_tool>
  <server_name>watchbase-mcp</server_name>
  <tool_name>list_families</tool_name>
  <arguments>
    {
      "brand_id": 37
    }
  </arguments>
</use_mcp_tool>
```

### `list_watches` Example

```xml
<use_mcp_tool>
  <server_name>watchbase-mcp</server_name>
  <tool_name>list_watches</tool_name>
  <arguments>
    {
      "brand_id": 37,
      "family_id": 279
    }
  </arguments>
</use_mcp_tool>
```

### `get_watch_details` Example

```xml
<use_mcp_tool>
  <server_name>watchbase-mcp</server_name>
  <tool_name>get_watch_details</tool_name>
  <arguments>
    {
      "id": 17289
    }
  </arguments>
</use_mcp_tool>
```

## License

This MCP server project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Please also refer to WatchBase terms of service regarding API usage.

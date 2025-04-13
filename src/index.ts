#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  // ToolDefinition removed - type will be inferred or is not needed explicitly
} from '@modelcontextprotocol/sdk/types.js';
import axios, { type AxiosInstance, type AxiosError } from 'axios';

// Retrieve API key from environment variable set in MCP settings
const API_KEY = process.env.WATCHBASE_API_KEY;
if (!API_KEY) {
  console.error('WATCHBASE_API_KEY environment variable is required');
  process.exit(1); // Exit if API key is not provided
}

// --- Type guards for tool arguments ---

const isSearchArgs = (args: any): args is { q: string } =>
  typeof args === 'object' && args !== null && typeof args.q === 'string';

const isListFamiliesArgs = (args: any): args is { brand_id: string | number } =>
  typeof args === 'object' &&
  args !== null &&
  (typeof args.brand_id === 'string' || typeof args.brand_id === 'number');

const isListWatchesArgs = (
  args: any
): args is {
  brand_id: string | number;
  family_id?: string | number;
  updated_since?: string;
} =>
  typeof args === 'object' &&
  args !== null &&
  (typeof args.brand_id === 'string' || typeof args.brand_id === 'number') &&
  (args.family_id === undefined ||
    typeof args.family_id === 'string' ||
    typeof args.family_id === 'number') &&
  (args.updated_since === undefined ||
    (typeof args.updated_since === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(args.updated_since))); // Basic YYYY-MM-DD check

const isGetWatchDetailsArgs = (args: any): args is { id: string | number } =>
  typeof args === 'object' &&
  args !== null &&
  (typeof args.id === 'string' || typeof args.id === 'number');

// --- Main Server Class ---

class WatchBaseServer {
  private server: Server;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: 'watchbase-mcp',
        version: '0.1.0',
        description:
          'Structured and standardized querying of watch-related metadata such as brands families and reference details from WatchBase.com',
      },
      {
        capabilities: {
          resources: {}, // No resources defined for this server
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: 'https://api.watchbase.com/v1/',
      params: {
        key: API_KEY,
        format: 'json', // Default to JSON format
      },
      timeout: 15000, // 15 second timeout
    });

    this.setupToolHandlers();

    // Basic error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    // Type annotation removed for tools - structure defines the type
    const tools = [
      {
        name: 'search',
        description:
          'Search the database by brand name, family name, watch name and reference number (whole words).',
        inputSchema: {
          type: 'object',
          properties: {
            q: { type: 'string', description: 'Search keywords' },
          },
          required: ['q'],
        },
      },
      {
        name: 'search_refnr',
        description:
          'Search the database by reference number (allows partial matches).',
        inputSchema: {
          type: 'object',
          properties: {
            q: { type: 'string', description: 'Search keywords (reference number)' },
          },
          required: ['q'],
        },
      },
      {
        name: 'list_brands',
        description: 'Retrieve a list of all brands in the database.',
        inputSchema: { type: 'object', properties: {} }, // No input required
      },
      {
        name: 'list_families',
        description: 'Retrieve a list of all families for a given brand.',
        inputSchema: {
          type: 'object',
          properties: {
            brand_id: {
              oneOf: [{ type: 'string' }, { type: 'number' }],
              description: 'BrandID of the brand',
            },
          },
          required: ['brand_id'],
        },
      },
      {
        name: 'list_watches',
        description:
          'Retrieve a list of watches for a particular Brand and/or Family, optionally filtered by update date.',
        inputSchema: {
          type: 'object',
          properties: {
            brand_id: {
              oneOf: [{ type: 'string' }, { type: 'number' }],
              description: 'BrandID of the brand',
            },
            family_id: {
              oneOf: [{ type: 'string' }, { type: 'number' }],
              description: 'Optional: FamilyID of the family',
            },
            updated_since: {
              type: 'string',
              format: 'date', // Indicates YYYY-MM-DD format
              description:
                'Optional: Limit results to watches updated after this date (YYYY-MM-DD)',
            },
          },
          required: ['brand_id'],
        },
      },
      {
        name: 'get_watch_details',
        description: 'Retrieve the full details for a particular watch by its ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              oneOf: [{ type: 'string' }, { type: 'number' }],
              description: 'ID of the watch',
            },
          },
          required: ['id'],
        },
      },
    ];

    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      let apiPath = '';
      let apiParams: Record<string, any> = {};

      try {
        switch (name) {
          case 'search':
            if (!isSearchArgs(args)) throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments for search');
            apiPath = 'search';
            apiParams = { q: args.q };
            break;

          case 'search_refnr':
            if (!isSearchArgs(args)) throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments for search_refnr');
            apiPath = 'search/refnr';
            apiParams = { q: args.q };
            break;

          case 'list_brands':
            // No specific argument validation needed
            apiPath = 'brands';
            break;

          case 'list_families':
            if (!isListFamiliesArgs(args)) throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments for list_families');
            apiPath = 'families';
            apiParams = { 'brand-id': args.brand_id }; // API uses hyphen
            break;

          case 'list_watches':
            if (!isListWatchesArgs(args)) throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments for list_watches');
            apiPath = 'watches';
            apiParams = { 'brand-id': args.brand_id }; // API uses hyphen
            if (args.family_id !== undefined) {
              apiParams['family-id'] = args.family_id; // API uses hyphen
            }
            if (args.updated_since !== undefined) {
              apiParams['updated-since'] = args.updated_since; // API uses hyphen
            }
            break;

          case 'get_watch_details':
            if (!isGetWatchDetailsArgs(args)) throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments for get_watch_details');
            apiPath = 'watch';
            apiParams = { id: args.id };
            break;

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }

        // Make the API call
        const response = await this.axiosInstance.get(apiPath, { params: apiParams });

        // Return successful response
        return {
          content: [
            {
              type: 'text', // Corrected type to 'text'
              text: JSON.stringify(response.data, null, 2), // JSON content is in the text field
            },
          ],
        };
      } catch (error) {
        console.error(`Error calling tool ${name}:`, error); // Log the error server-side

        let errorMessage = `Failed to execute tool ${name}.`;
        let errorCode = ErrorCode.InternalError;

        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<any>;
          errorMessage = `WatchBase API error: ${axiosError.response?.data?.error || axiosError.response?.statusText || axiosError.message}`;
          // Map HTTP status codes to MCP error codes if desired
          if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
            errorCode = ErrorCode.InternalError; // Changed from PermissionDenied
            errorMessage = `WatchBase API error: Invalid or unauthorized API key. Status: ${axiosError.response?.status}`;
          } else if (axiosError.response?.status === 404) {
            errorCode = ErrorCode.InvalidRequest; // Changed from NotFound
            errorMessage = `WatchBase API error: Resource not found. Status: 404`;
          } else if (axiosError.response?.status === 400) {
            errorCode = ErrorCode.InvalidParams; // Bad request, likely invalid params
            errorMessage = `WatchBase API error: Bad request (check parameters). Status: 400. ${axiosError.response?.data?.error || ''}`;
          }
        } else if (error instanceof McpError) {
          // Re-throw specific MCP errors (like InvalidParams, MethodNotFound)
          throw error;
        }

        // Return error content
        return {
          content: [
            {
              type: 'text',
              text: errorMessage,
            },
          ],
          isError: true,
          errorCode: errorCode, // Provide specific error code
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    // Use console.error for logs to avoid interfering with MCP stdout communication
    console.error('WatchBase MCP server running on stdio');
  }
}

// Instantiate and run the server
const server = new WatchBaseServer();
server.run().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

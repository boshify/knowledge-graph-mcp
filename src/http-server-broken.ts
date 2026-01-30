#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { searchEntities, lookupEntities, SearchOptions } from './client.js';
import express from 'express';
import cors from 'cors';

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Store active transports by session ID
const transports = new Map<string, SSEServerTransport>();

// Create MCP server with handlers
function createMCPServer() {
  const server = new Server(
    {
      name: 'google-knowledge-graph-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'search_knowledge_graph',
          description: 'Search Google Knowledge Graph for entities by name or topic. Returns structured information about real-world entities like people, places, organizations, and concepts from Google\'s public knowledge base.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query for entities (e.g., "Taylor Swift", "Eiffel Tower", "Python programming")',
              },
              languages: {
                type: 'array',
                items: { type: 'string' },
                description: 'Language codes (ISO 639, e.g., ["en", "es", "fr"]). Default: ["en"]',
              },
              types: {
                type: 'array',
                items: { type: 'string' },
                description: 'Filter by schema.org types (e.g., ["Person", "Organization", "Place"])',
              },
              limit: {
                type: 'number',
                minimum: 1,
                maximum: 500,
                description: 'Maximum results to return (1-500). Default: 20',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'lookup_knowledge_graph_entities',
          description: 'Look up specific Knowledge Graph entities by their Machine IDs (MIDs). Use this when you already know the entity IDs from a previous search. MIDs look like /m/0dl567 or /g/11b6vwtjpg.',
          inputSchema: {
            type: 'object',
            properties: {
              ids: {
                type: 'array',
                items: { type: 'string' },
                minItems: 1,
                description: 'Entity Machine IDs (MIDs) to lookup (e.g., ["/m/0dl567"])',
              },
              languages: {
                type: 'array',
                items: { type: 'string' },
                description: 'Language codes for results. Default: ["en"]',
              },
            },
            required: ['ids'],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: args } = request.params;

      if (name === 'search_knowledge_graph') {
        const { query, languages, types, limit } = args as any;

        const options: SearchOptions = {
          query,
          languages: languages || ['en'],
          types,
          limit: limit || 20,
        };

        const entities = await searchEntities(options);

        const output = {
          entities: entities.map(e => {
            const rawMid = e['@id'] || '';
            const mid = rawMid.replace(/^kg:/, '');

            return {
              mid,
              name: e.name || '',
              type: Array.isArray(e['@type']) ? e['@type'] : [e['@type'] || 'Thing'],
              description: e.description || undefined,
              detailedDescription: e.detailedDescription?.articleBody || undefined,
              image: e.image?.contentUrl || undefined,
              url: e.url || undefined,
              resultScore: e.resultScore || undefined,
            };
          }),
          count: entities.length,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(output, null, 2),
            },
          ],
        };
      }

      if (name === 'lookup_knowledge_graph_entities') {
        const { ids, languages } = args as any;

        const entities = await lookupEntities(ids, languages || ['en']);

        const output = {
          entities: entities.map(e => {
            const rawMid = e['@id'] || '';
            const mid = rawMid.replace(/^kg:/, '');

            return {
              mid,
              name: e.name || '',
              type: Array.isArray(e['@type']) ? e['@type'] : [e['@type'] || 'Thing'],
              description: e.description || undefined,
              detailedDescription: e.detailedDescription?.articleBody || undefined,
              image: e.image?.contentUrl || undefined,
              url: e.url || undefined,
              resultScore: e.resultScore || undefined,
            };
          }),
          count: entities.length,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(output, null, 2),
            },
          ],
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'google-knowledge-graph-mcp' });
});

// SSE endpoint for MCP
app.get('/sse', async (req, res) => {
  const sessionId = Math.random().toString(36).substring(7);
  console.log(`New SSE connection [${sessionId}] from:`, req.headers.origin || 'unknown');

  try {
    const server = createMCPServer();
    const transport = new SSEServerTransport(`/message/${sessionId}`, res);

    // Store transport for this session
    transports.set(sessionId, transport);

    await server.connect(transport);
    console.log(`MCP server connected via SSE [${sessionId}]`);

    // Clean up on close
    req.on('close', () => {
      console.log(`SSE connection closed [${sessionId}]`);
      transports.delete(sessionId);
    });
  } catch (error) {
    console.error(`Error setting up SSE connection [${sessionId}]:`, error);
    transports.delete(sessionId);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to establish SSE connection' });
    }
  }
});

// Message endpoint for client requests - route to appropriate transport
app.post('/message/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  console.log(`Received message for session [${sessionId}]:`, JSON.stringify(req.body).substring(0, 100));

  const transport = transports.get(sessionId);
  if (!transport) {
    console.error(`No transport found for session [${sessionId}]`);
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    // Forward the message to the transport
    await transport.handlePostMessage(req, res);
  } catch (error) {
    console.error(`Error handling message for session [${sessionId}]:`, error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to handle message' });
    }
  }
});

// REST API endpoints as fallback
app.post('/api/search', async (req, res) => {
  try {
    const { query, languages, types, limit } = req.body;

    const options: SearchOptions = {
      query,
      languages: languages || ['en'],
      types,
      limit: limit || 20,
    };

    const entities = await searchEntities(options);

    const output = {
      entities: entities.map(e => {
        const rawMid = e['@id'] || '';
        const mid = rawMid.replace(/^kg:/, '');

        return {
          mid,
          name: e.name || '',
          type: Array.isArray(e['@type']) ? e['@type'] : [e['@type'] || 'Thing'],
          description: e.description || undefined,
          detailedDescription: e.detailedDescription?.articleBody || undefined,
          image: e.image?.contentUrl || undefined,
          url: e.url || undefined,
          resultScore: e.resultScore || undefined,
        };
      }),
      count: entities.length,
    };

    res.json(output);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

app.post('/api/lookup', async (req, res) => {
  try {
    const { ids, languages } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const entities = await lookupEntities(ids, languages || ['en']);

    const output = {
      entities: entities.map(e => {
        const rawMid = e['@id'] || '';
        const mid = rawMid.replace(/^kg:/, '');

        return {
          mid,
          name: e.name || '',
          type: Array.isArray(e['@type']) ? e['@type'] : [e['@type'] || 'Thing'],
          description: e.description || undefined,
          detailedDescription: e.detailedDescription?.articleBody || undefined,
          image: e.image?.contentUrl || undefined,
          url: e.url || undefined,
          resultScore: e.resultScore || undefined,
        };
      }),
      count: entities.length,
    };

    res.json(output);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Google Knowledge Graph MCP Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`   REST API:     http://localhost:${PORT}/api/search`);
});

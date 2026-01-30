#!/usr/bin/env node

/**
 * Simple test to verify the MCP server can start and respond to requests
 * This simulates what Claude Desktop would do when connecting to the server
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load API key from .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

console.log('Starting MCP Server test...\n');

// Start the MCP server
const serverProcess = spawn('node', ['dist/index.js'], {
  env: process.env,
  stdio: ['pipe', 'pipe', 'pipe']
});

let responseBuffer = '';
let requestId = 1;

// Handle server output
serverProcess.stdout.on('data', (data) => {
  responseBuffer += data.toString();

  // Try to parse complete JSON-RPC messages
  const lines = responseBuffer.split('\n');
  responseBuffer = lines.pop() || ''; // Keep incomplete line in buffer

  lines.forEach(line => {
    if (line.trim()) {
      try {
        const message = JSON.parse(line);
        console.log('📥 Received:', JSON.stringify(message, null, 2));

        // If we got a response to list_tools, now request a tool call
        if (message.result && message.result.tools) {
          console.log('\n✅ Server listed tools successfully!');
          console.log(`   Found ${message.result.tools.length} tool(s):`);
          message.result.tools.forEach(tool => {
            console.log(`   - ${tool.name}: ${tool.description.substring(0, 80)}...`);
          });

          // Now test calling a tool
          console.log('\n📤 Testing tool call: search_knowledge_graph...');
          const toolCallRequest = {
            jsonrpc: '2.0',
            id: ++requestId,
            method: 'tools/call',
            params: {
              name: 'search_knowledge_graph',
              arguments: {
                query: 'Marie Curie',
                limit: 1
              }
            }
          };
          serverProcess.stdin.write(JSON.stringify(toolCallRequest) + '\n');
        }

        // If we got a tool call result
        if (message.result && message.result.content) {
          console.log('\n✅ Tool call succeeded!');
          try {
            const content = message.result.content[0].text;
            const result = JSON.parse(content);
            console.log('\n📊 Knowledge Graph Results:');
            console.log(`   Found ${result.count} entity(ies)`);
            if (result.entities && result.entities[0]) {
              const entity = result.entities[0];
              console.log(`   Name: ${entity.name}`);
              console.log(`   Type: ${entity.type.join(', ')}`);
              console.log(`   Description: ${entity.description || 'N/A'}`);
              console.log(`   MID: ${entity.mid}`);
            }
          } catch (e) {
            console.log('   Raw result:', message.result.content[0].text.substring(0, 200));
          }

          console.log('\n' + '='.repeat(60));
          console.log('✅ MCP Server is fully functional!');
          console.log('='.repeat(60));

          // Clean shutdown
          setTimeout(() => {
            serverProcess.kill();
            process.exit(0);
          }, 500);
        }

        // Handle errors
        if (message.error) {
          console.error('\n❌ Error from server:', message.error);
          serverProcess.kill();
          process.exit(1);
        }
      } catch (e) {
        // Not valid JSON yet, ignore
      }
    }
  });
});

serverProcess.stderr.on('data', (data) => {
  console.error('Server stderr:', data.toString());
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\n❌ Server exited with code ${code}`);
    process.exit(code);
  }
});

// Send initialization request
console.log('📤 Sending initialize request...');
const initRequest = {
  jsonrpc: '2.0',
  id: requestId,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

// Give server a moment to start
setTimeout(() => {
  serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');

  // After initialization, request tools list
  setTimeout(() => {
    console.log('\n📤 Requesting tools list...');
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: ++requestId,
      method: 'tools/list',
      params: {}
    };
    serverProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');
  }, 1000);
}, 500);

// Timeout after 10 seconds
setTimeout(() => {
  console.error('\n❌ Test timeout - server may be unresponsive');
  serverProcess.kill();
  process.exit(1);
}, 10000);

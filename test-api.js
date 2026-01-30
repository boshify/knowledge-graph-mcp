#!/usr/bin/env node

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

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

const API_KEY = process.env.GOOGLE_KNOWLEDGE_GRAPH_API_KEY;

if (!API_KEY) {
  console.error('❌ Error: GOOGLE_KNOWLEDGE_GRAPH_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('✓ API Key loaded from .env.local');
console.log(`  Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}\n`);

// Test function
async function testKnowledgeGraphAPI() {
  console.log('Testing Google Knowledge Graph API...\n');

  // Test 1: Search for a well-known entity
  console.log('Test 1: Searching for "Albert Einstein"');
  const searchUrl = `https://kgsearch.googleapis.com/v1/entities:search?query=Albert%20Einstein&key=${API_KEY}&limit=1`;

  try {
    const response = await fetch(searchUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API request failed: ${response.status} ${response.statusText}`);
      console.error(`   Response: ${errorText}\n`);
      return false;
    }

    const data = await response.json();

    if (data.itemListElement && data.itemListElement.length > 0) {
      const entity = data.itemListElement[0].result;
      console.log('✅ API is working!');
      console.log('\nEntity found:');
      console.log(`  Name: ${entity.name}`);
      console.log(`  Type: ${Array.isArray(entity['@type']) ? entity['@type'].join(', ') : entity['@type']}`);
      console.log(`  Description: ${entity.description || 'N/A'}`);
      console.log(`  MID: ${entity['@id'] || 'N/A'}`);
      console.log(`  Score: ${data.itemListElement[0].resultScore}`);

      if (entity.detailedDescription) {
        console.log(`  Details: ${entity.detailedDescription.articleBody?.substring(0, 150)}...`);
      }

      return true;
    } else {
      console.log('⚠️  API responded but returned no results');
      return false;
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

// Run the test
testKnowledgeGraphAPI()
  .then(success => {
    console.log('\n' + '='.repeat(60));
    if (success) {
      console.log('✅ MCP Server is ready to use!');
      console.log('\nYou can now:');
      console.log('1. Add this to your Claude Desktop config');
      console.log('2. Restart Claude Desktop');
      console.log('3. Ask Claude to search the knowledge graph');
    } else {
      console.log('❌ There may be an issue with your API key or configuration');
    }
    console.log('='.repeat(60));
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

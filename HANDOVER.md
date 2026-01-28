# Google Knowledge Graph Search MCP - Handover Document

**Date:** 2026-01-28  
**Working Directory:** `C:\MCP\google-knowledge-graph-search-mcp\`  
**Status:** ✅ Built, tested, repository pushed - awaiting npm publication  
**GitHub:** https://github.com/houtini-ai/google-knowledge-graph-mcp

---

## What We Built

An MCP server that connects Claude (or any MCP client) to Google's **free public** Knowledge Graph Search API. Search for real-world entities (people, places, organisations, concepts) and get structured data back.

**Key Point:** This uses the FREE public API at `kgsearch.googleapis.com`, NOT the paid Enterprise API. No billing account required.

---

## Current Status

### ✅ Completed

**Code:**
- Two working tools: `search_knowledge_graph` and `lookup_knowledge_graph_entities`
- TypeScript source in `src/`
- Compiled JavaScript + types in `dist/`
- CommonJS module format (MCP SDK compatibility)
- Error handling and validation
- API key from environment variables

**Documentation:**
- Professional README written in Richard's voice (no AI clichés)
- CONTRIBUTING.md for open source contributions
- CHANGELOG.md for version tracking
- .env.example with clear setup instructions
- MIT licence

**Testing:**
- Built successfully: `npm run build`
- Tested in Claude Desktop
- Search functionality verified
- Lookup functionality verified
- API key validation working

**Repository:**
- GitHub: https://github.com/houtini-ai/google-knowledge-graph-mcp
- Clean repository (dev docs removed)
- v1.0.0 tag created and pushed
- Professional commit history

**Package:**
- Package name: `@houtini/google-knowledge-graph-mcp`
- Version: 1.0.0
- Size: 11.5 kB (14 files)
- Includes: dist/, src/, README.md, LICENSE, .env.example
- Ready for npm publication

### ⏳ Awaiting Completion

**npm Publication:**
- Authentication issue with Desktop Commander spawning new PowerShell sessions
- User needs to run manually in their authenticated terminal:
  ```powershell
  cd C:\MCP\google-knowledge-graph-search-mcp
  npm publish --access public
  ```

**GitHub Configuration (Web UI):**
- Add repository description
- Add topics/tags
- Optionally create release page from v1.0.0 tag

---

## How to Complete Publication

### 1. Publish to npm

In your terminal (where you're already logged in to npm):

```powershell
cd C:\MCP\google-knowledge-graph-search-mcp
npm publish --access public
```

If it asks for 2FA, enter your current authenticator code.

**Verify publication:**
```powershell
npm view @houtini/google-knowledge-graph-mcp
```

### 2. Configure GitHub Repository

Go to: https://github.com/houtini-ai/google-knowledge-graph-mcp

**Add Description:**
```
MCP server for Google's free public Knowledge Graph Search API - search for structured entity information about people, places, organizations, and concepts
```

**Add Topics:**
```
mcp, model-context-protocol, google, knowledge-graph, search, entities, claude, ai-assistant, semantic-search, entity-recognition, typescript, api-client, structured-data
```

**How:**
1. Click "About" gear icon (top right)
2. Paste description
3. Add topics (comma-separated)
4. Save

### 3. Create Release (Optional but Recommended)

1. Go to Releases tab
2. Click "Draft a new release"
3. Choose tag: v1.0.0
4. Release title: "v1.0.0 - Initial Release"
5. Description: See CHANGELOG.md for content
6. Publish release

---

## Technical Details

### Architecture

**Language:** TypeScript compiled to CommonJS  
**Framework:** @modelcontextprotocol/sdk v1.0.4  
**API:** Google Knowledge Graph Search API (free public)  
**Endpoint:** https://kgsearch.googleapis.com/v1/entities:search

### Files Structure

```
google-knowledge-graph-search-mcp/
├── src/
│   ├── client.ts          # Google API client
│   └── index.ts           # MCP server implementation
├── dist/                   # Compiled JavaScript + types
├── README.md               # Main documentation
├── CONTRIBUTING.md         # Contribution guidelines
├── CHANGELOG.md            # Version history
├── LICENSE                 # MIT licence
├── .env.example            # Configuration template
├── package.json            # Package metadata
└── tsconfig.json           # TypeScript config
```

### Environment Variables

```bash
GOOGLE_KNOWLEDGE_GRAPH_API_KEY=your_api_key_here
```

### Tools Available

**1. search_knowledge_graph**
- Search entities by query string
- Parameters: query (required), languages, types, limit
- Returns: Array of entities with MIDs, names, descriptions, URLs

**2. lookup_knowledge_graph_entities**
- Lookup entities by Machine IDs (MIDs)
- Parameters: ids (required), languages
- Returns: Entity details

### Usage Example

```json
{
  "mcpServers": {
    "google-knowledge-graph": {
      "command": "npx",
      "args": ["-y", "@houtini/google-knowledge-graph-mcp"],
      "env": {
        "GOOGLE_KNOWLEDGE_GRAPH_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

---

## Getting API Key (Free)

1. Go to https://console.cloud.google.com/
2. Create/select a project
3. Enable "Knowledge Graph Search API" (NOT Enterprise API)
4. Create credentials → API key
5. (Optional) Restrict key to Knowledge Graph Search API only

**No billing account required!**

---

## Research Task for Next Session

**Ask Gemini (NO grounding) to explain:**

"What is the Google Knowledge Graph Search MCP and what problem does it solve? Explain in simple terms what the Knowledge Graph is, why someone would want MCP access to it, and what kinds of queries it's useful for."

**Why ask Gemini without grounding:**
- Tests if our README/documentation is clear enough
- Gets an outside perspective on what we've built
- May highlight use cases we haven't documented
- Validates our technical explanation
- Could improve marketing/positioning

**Expected insights:**
- Is the value proposition clear?
- Are we explaining the free vs paid API well enough?
- What use cases should we highlight more?
- Is the technical level appropriate?

---

## Build Commands Reference

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Development mode (watch)
npm run dev

# Test package contents
npm pack --dry-run

# Publish to npm (when authenticated)
npm publish --access public
```

---

## Known Issues

**npm publication authentication:**
- Desktop Commander spawns new PowerShell sessions
- These don't inherit npm login credentials
- Must publish manually in authenticated terminal

**package.json warning:**
- npm normalizes repository.url to include "git+" prefix
- This is cosmetic and can be fixed with `npm pkg fix`
- Doesn't affect functionality

---

## Quality Metrics

✅ **Code Quality:**
- TypeScript strict mode
- Proper error handling
- Clean interfaces
- No console.log statements
- CommonJS compatibility

✅ **Documentation Quality:**
- Written in Richard's voice
- No AI clichés
- Real examples
- British English
- Honest about scope

✅ **Package Quality:**
- Minimal size (11.5 kB)
- Essential files only
- TypeScript definitions included
- Source maps generated
- Clean dependencies

---

## Next Steps After Publication

1. Test installation: `npx @houtini/google-knowledge-graph-mcp`
2. Update README badges to point to live npm package
3. Monitor for issues/questions
4. Consider writing MCP article about the build process
5. Promote to MCP community if appropriate

---

## Contact & Links

**Repository:** https://github.com/houtini-ai/google-knowledge-graph-mcp  
**Package:** @houtini/google-knowledge-graph-mcp (pending publication)  
**Author:** Richard Baxter <richard@houtini.ai>  
**Website:** https://houtini.ai

---

**Status:** Ready for final publication step (npm publish command in authenticated terminal)

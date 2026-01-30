# Custom GPT Setup Guide

## GPT Configuration

### Basic Info

**Name**: Knowledge Graph Explorer

**Description**:
Search Google's Knowledge Graph for verified information about people, places, organizations, events, and concepts. Get structured data with descriptions, images, and links to authoritative sources.

---

## Instructions (Paste this in "Instructions" field)

```
You are the Knowledge Graph Explorer, a specialized assistant that helps users discover and understand real-world entities using Google's Knowledge Graph.

## Your Capabilities

You have access to Google's Knowledge Graph Search API, which contains structured information about millions of entities including:
- **People**: Historical figures, celebrities, scientists, artists
- **Places**: Cities, countries, landmarks, geographical locations
- **Organizations**: Companies, institutions, non-profits
- **Events**: Historical events, festivals, conferences
- **Creative Works**: Books, movies, music, art
- **Concepts**: Programming languages, scientific terms, products

## How to Help Users

1. **Search for entities** when users ask about people, places, things, or concepts
2. **Provide structured information** including:
   - Official names and alternative names
   - Detailed descriptions (often from Wikipedia)
   - Entity types (Person, Place, Organization, etc.)
   - Official URLs and images
   - Machine IDs (MIDs) for further research
3. **Filter by type** when users want specific kinds of entities
4. **Compare entities** by searching for multiple items
5. **Verify facts** by cross-referencing Knowledge Graph data

## Search Guidelines

- When users ask about a topic, automatically search the Knowledge Graph
- For ambiguous queries, return multiple results and ask which one they meant
- Include relevance scores to show confidence
- Cite the Knowledge Graph as your source
- Provide both brief summaries and detailed information when available
- If no results found, suggest alternative search terms

## Response Style

- Be informative but conversational
- Present data in a clear, organized format
- Use bullet points for key facts
- Include images URLs when available
- Cite Machine IDs (MIDs) for reference
- Offer to search for related entities

## Example Interactions

User: "Who is Marie Curie?"
You: Search Knowledge Graph → Present her biography, achievements, and key facts

User: "Tell me about the Eiffel Tower"
You: Search → Provide location, history, architectural details, visiting info

User: "Compare Python and JavaScript programming languages"
You: Search for both → Present side-by-side comparison of their characteristics

User: "Find famous female scientists"
You: Search with type filter "Person" → Present list with descriptions

## Important Notes

- Knowledge Graph contains verified, authoritative information
- Data is primarily sourced from Wikipedia and official sources
- Not all entities are in the Knowledge Graph - if not found, explain this
- Relevance scores indicate confidence in results
- Machine IDs (MIDs) are unique identifiers (format: /m/xxxxx)
```

---

## Actions Schema (Paste this in "Actions" → "Schema")

```yaml
openapi: 3.1.0
info:
  title: Google Knowledge Graph Search API
  description: Search Google's Knowledge Graph for verified entity information
  version: 1.0.0
servers:
  - url: https://knowledge-graph-mcp-production-65ca.up.railway.app
    description: Production API
paths:
  /api/search:
    post:
      operationId: searchKnowledgeGraph
      summary: Search for entities in Google's Knowledge Graph
      description: Search for people, places, organizations, events, and concepts
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                query:
                  type: string
                  description: Search query (e.g., "Albert Einstein", "Eiffel Tower", "Python programming")
                  example: "Marie Curie"
                limit:
                  type: integer
                  description: Maximum number of results to return (1-500)
                  default: 5
                  minimum: 1
                  maximum: 500
                languages:
                  type: array
                  items:
                    type: string
                  description: Language codes (ISO 639, e.g., ["en", "es", "fr"])
                  default: ["en"]
                types:
                  type: array
                  items:
                    type: string
                  description: Filter by schema.org entity types (e.g., ["Person", "Organization", "Place"])
                  example: ["Person"]
              required:
                - query
      responses:
        '200':
          description: Successful response with entity data
          content:
            application/json:
              schema:
                type: object
                properties:
                  entities:
                    type: array
                    items:
                      type: object
                      properties:
                        mid:
                          type: string
                          description: Machine ID (unique identifier)
                        name:
                          type: string
                          description: Entity name
                        type:
                          type: array
                          items:
                            type: string
                          description: Entity types
                        description:
                          type: string
                          description: Brief description
                        detailedDescription:
                          type: string
                          description: Detailed description (often from Wikipedia)
                        image:
                          type: string
                          description: Image URL
                        url:
                          type: string
                          description: Official URL or Wikipedia link
                        resultScore:
                          type: number
                          description: Relevance score
                  count:
                    type: integer
                    description: Number of results returned
        '500':
          description: Server error
  /api/lookup:
    post:
      operationId: lookupEntityByID
      summary: Look up specific entities by their Machine IDs
      description: Retrieve entities when you already know their MIDs
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                ids:
                  type: array
                  items:
                    type: string
                  description: Array of Machine IDs (e.g., ["/m/053_d", "/m/0jcx"])
                  example: ["/m/053_d"]
                languages:
                  type: array
                  items:
                    type: string
                  description: Language codes for results
                  default: ["en"]
              required:
                - ids
      responses:
        '200':
          description: Successful response
        '400':
          description: Invalid request (missing or empty ids array)
        '500':
          description: Server error
```

---

## Conversation Starters

### Option 1: General Search
```
Who is Marie Curie?
```

### Option 2: Places
```
Tell me about the Eiffel Tower
```

### Option 3: Comparison
```
Compare Python and JavaScript programming languages
```

### Option 4: Discovery
```
Find famous scientists from the 20th century
```

---

## Additional Settings

### Capabilities
- ✅ **Web Browsing**: Off (not needed)
- ✅ **DALL-E**: Off (not needed)
- ✅ **Code Interpreter**: Off (not needed)

### Profile Picture
Consider using an icon related to:
- 🔍 Magnifying glass (search)
- 🌐 Globe (knowledge)
- 📚 Books (information)
- 🧠 Brain (knowledge)

---

## Testing Your GPT

Once configured, test with these queries:

1. **"Who invented the telephone?"** → Should find Alexander Graham Bell
2. **"What is the Louvre Museum?"** → Should find the Paris museum
3. **"Tell me about Tesla (the company)"** → Should find Tesla, Inc.
4. **"Who is BTS?"** → Should find the K-pop group
5. **"What is quantum physics?"** → Should find the concept

---

## Tips for Best Results

### Good Queries
- ✅ "Who is Marie Curie?"
- ✅ "Tell me about the Eiffel Tower"
- ✅ "What is Python programming?"
- ✅ "Find information about Tesla"

### Queries to Refine
- ❌ "famous people" → ✅ "famous scientists" or specific name
- ❌ "big building" → ✅ "Eiffel Tower" or specific landmark
- ❌ "that thing in Paris" → ✅ "Eiffel Tower" or clearer description

### Advanced Searches
- **Type filtering**: "Find people named Einstein"
- **Comparisons**: "Compare Tokyo and New York"
- **Related entities**: "Other works by this author"

---

## Publishing Your GPT

1. Click **"Save"** in the top right
2. Choose who can access:
   - **Only me**: Private use
   - **Anyone with a link**: Share with specific people
   - **Public**: Available in GPT Store (requires ChatGPT Plus)
3. Click **"Confirm"**

---

## Example GPT URL
Once published, you'll get a URL like:
```
https://chat.openai.com/g/g-XXXXXXXX-knowledge-graph-explorer
```

Share this link to let others use your GPT!

---

## Troubleshooting

**GPT not finding entities?**
- Check that the Railway API is still running
- Verify the API URL in Actions schema is correct
- Test the API directly: `curl https://your-url/health`

**Getting errors?**
- Check Railway logs for issues
- Verify environment variable is set
- Ensure Google API key is valid

**Results seem wrong?**
- Knowledge Graph returns best matches based on query
- Try more specific search terms
- Use type filters to narrow results

---

## Support

- **Repository**: https://github.com/boshify/knowledge-graph-mcp
- **API Health**: https://knowledge-graph-mcp-production-65ca.up.railway.app/health
- **Railway Dashboard**: https://railway.app/dashboard

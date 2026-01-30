# Quick Start: Deploy to Railway

## 🚀 Deploy in 5 Minutes

### Step 1: Go to Railway
Visit: https://railway.app

### Step 2: Deploy from GitHub
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **`boshify/knowledge-graph-mcp`**
4. Railway will automatically detect the configuration

### Step 3: Add Your API Key
1. In Railway dashboard, click on your deployed service
2. Go to **"Variables"** tab
3. Click **"New Variable"**
4. Add:
   - **Key**: `GOOGLE_KNOWLEDGE_GRAPH_API_KEY`
   - **Value**: `YOUR_GOOGLE_API_KEY_HERE`

### Step 4: Get Your URL
- Railway will give you a public URL like: `https://knowledge-graph-mcp-production.up.railway.app`
- Copy this URL!

## 🧪 Test Your Deployment

```bash
# Test health (replace with your Railway URL)
curl https://your-app.railway.app/health

# Test search
curl -X POST https://your-app.railway.app/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Marie Curie", "limit": 1}'
```

## 💬 Use with Claude (Web Browser)

Claude web doesn't have built-in MCP support, but you can:

### Method 1: Share the API endpoint
Tell Claude:
```
I have a Knowledge Graph API deployed at https://your-app.railway.app

The API endpoints are:
- POST /api/search - Search entities
- POST /api/lookup - Lookup by ID

Can you help me search for information about [topic]?
```

### Method 2: Artifacts / Custom Tools
Create a simple HTML interface and have Claude make fetch requests to your API

## 🤖 Use with ChatGPT (Custom GPT)

### Create a Custom GPT:

1. Go to: https://chat.openai.com/gpts/editor
2. Click **"Create a GPT"**
3. In the "Configure" tab:
   - **Name**: Knowledge Graph Search
   - **Description**: Search Google's Knowledge Graph for entity information

4. Under **"Actions"**, click **"Create new action"**
5. Paste this schema (replace YOUR_RAILWAY_URL):

```yaml
openapi: 3.1.0
info:
  title: Google Knowledge Graph API
  description: Search Google's Knowledge Graph for entity information
  version: 1.0.0
servers:
  - url: https://your-app.railway.app
paths:
  /api/search:
    post:
      operationId: searchKnowledgeGraph
      summary: Search for entities in Google Knowledge Graph
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                query:
                  type: string
                  description: Search query (e.g., "Albert Einstein", "Eiffel Tower")
                limit:
                  type: integer
                  description: Maximum results (1-500, default 20)
                  default: 5
                languages:
                  type: array
                  items:
                    type: string
                  description: Language codes (e.g., ["en"])
                types:
                  type: array
                  items:
                    type: string
                  description: Entity types (e.g., ["Person", "Place"])
              required:
                - query
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  entities:
                    type: array
                  count:
                    type: integer
  /api/lookup:
    post:
      operationId: lookupEntity
      summary: Look up entities by their Machine IDs
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
                  description: Entity IDs (e.g., ["/m/053_d"])
                languages:
                  type: array
                  items:
                    type: string
              required:
                - ids
      responses:
        '200':
          description: Successful response
```

6. Click **"Save"**
7. Now you can ask your Custom GPT: "Search for Marie Curie" and it will use your API!

## 📊 API Examples

### Search for a person
```bash
curl -X POST https://your-app.railway.app/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Taylor Swift",
    "types": ["Person"],
    "limit": 1
  }'
```

### Search for a place
```bash
curl -X POST https://your-app.railway.app/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Eiffel Tower",
    "types": ["Place"],
    "limit": 1
  }'
```

### Lookup by ID
```bash
curl -X POST https://your-app.railway.app/api/lookup \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["/m/053_d"]
  }'
```

## 💰 Cost

Railway free tier includes:
- **$5 credit/month** (usually enough for testing)
- **500 hours runtime**
- Automatic HTTPS
- Easy deployment

## 🔒 Security Tips

1. **Don't expose your API key** - It's set as an environment variable in Railway
2. **Consider adding authentication** if you want to make this public
3. **Monitor usage** in Railway dashboard
4. **Rate limiting** - Consider adding rate limits for production use

## 📚 Next Steps

- Read [DEPLOY.md](DEPLOY.md) for detailed deployment options
- View your repo: https://github.com/boshify/knowledge-graph-mcp
- Railway docs: https://docs.railway.app

## ❓ Troubleshooting

**Deployment fails?**
- Check Railway logs for errors
- Verify environment variable is set
- Ensure API key is valid

**API not responding?**
- Check if service is running in Railway dashboard
- Verify the URL is correct
- Test the /health endpoint first

**Getting 500 errors?**
- Check Railway logs
- Verify API key is correct
- Test locally first: `npm run start:http`

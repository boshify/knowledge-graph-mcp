# Deployment Guide

## Deploy to Railway

### Prerequisites
- Railway account (https://railway.app)
- Google Knowledge Graph API key

### Option 1: Deploy via GitHub (Recommended)

1. **Push this repository to GitHub** (already done!)
   - Repository: https://github.com/boshify/knowledge-graph-mcp

2. **Connect to Railway**:
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `boshify/knowledge-graph-mcp`

3. **Set Environment Variables**:
   - In Railway dashboard, go to your project
   - Click on "Variables"
   - Add variable:
     ```
     GOOGLE_KNOWLEDGE_GRAPH_API_KEY=your-api-key-here
     ```

4. **Deploy**:
   - Railway will automatically build and deploy
   - You'll get a URL like: `https://your-app.railway.app`

### Option 2: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Set environment variable
railway variables set GOOGLE_KNOWLEDGE_GRAPH_API_KEY=your-api-key-here

# Deploy
railway up
```

## Using with AI Assistants

### For Claude (Web - via API)

Claude web doesn't support custom MCP servers directly, but you can:

1. **Use as REST API**:
   ```bash
   curl -X POST https://your-app.railway.app/api/search \
     -H "Content-Type: application/json" \
     -d '{"query": "Albert Einstein", "limit": 1}'
   ```

2. **Share API endpoints with Claude**:
   - Tell Claude: "Use this API endpoint to search knowledge graph: https://your-app.railway.app/api/search"
   - Claude can make requests to your deployed API

### For ChatGPT (Custom GPT / Actions)

1. **Create a Custom GPT**:
   - Go to https://chat.openai.com/gpts/editor
   - Click "Create a GPT"
   - Configure Actions

2. **Add API Schema**:
   ```yaml
   openapi: 3.0.0
   info:
     title: Google Knowledge Graph API
     version: 1.0.0
   servers:
     - url: https://your-app.railway.app
   paths:
     /api/search:
       post:
         summary: Search knowledge graph
         requestBody:
           required: true
           content:
             application/json:
               schema:
                 type: object
                 properties:
                   query:
                     type: string
                   limit:
                     type: number
         responses:
           '200':
             description: Successful response
     /api/lookup:
       post:
         summary: Lookup entities by ID
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
         responses:
           '200':
             description: Successful response
   ```

### For Direct HTTP Access

The deployed server provides these endpoints:

- **Health Check**: `GET /health`
- **Search**: `POST /api/search`
  ```json
  {
    "query": "Marie Curie",
    "languages": ["en"],
    "types": ["Person"],
    "limit": 5
  }
  ```
- **Lookup**: `POST /api/lookup`
  ```json
  {
    "ids": ["/m/053_d"],
    "languages": ["en"]
  }
  ```

## Testing Your Deployment

Once deployed, test with:

```bash
# Test health endpoint
curl https://your-app.railway.app/health

# Test search
curl -X POST https://your-app.railway.app/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Taylor Swift", "limit": 1}'
```

## Monitoring

- Railway provides automatic logs and metrics
- View logs: Railway dashboard → Your project → Logs
- View metrics: Railway dashboard → Your project → Metrics

## Cost

- Railway free tier includes:
  - $5 credit per month
  - 500 hours of runtime
  - Perfect for testing and light usage

## Security Notes

- Never commit your API key to GitHub
- Always use environment variables
- Consider adding authentication if making the API public
- Railway provides automatic HTTPS

# FRIDAY — Final Cloud-Ready Product

This is a single downloadable, mobile-friendly FRIDAY-inspired AI assistant.

## What is fixed
The chat no longer depends on a hard-coded browser cloud endpoint. It uses the same server that hosts the app:

POST /api/chat

If an AI provider is configured, FRIDAY sends the conversation securely from the server. If no provider key is configured, a small local fallback keeps the assistant alive instead of showing a broken cloud message.

## Run
1. Install Node.js 18+.
2. Extract the ZIP.
3. Run: npm install
4. Copy .env.example to .env.
5. Put your own cloud AI API key in .env.
6. Start: npm start

## Cloud deployment
Deploy the folder to a Node-compatible host such as Render. Add environment variables in the host's Environment settings.

## Important
No private API key is bundled in this ZIP. That is intentional: putting a real key inside the downloadable app would expose it.

The UI is an original FRIDAY-inspired design and does not copy movie assets or proprietary voice/branding.

## Environment variables
- AI_API_KEY — your provider key
- AI_BASE_URL — defaults to https://api.openai.com/v1
- AI_MODEL — defaults to gpt-4o-mini
- PORT — hosting port

# ecommerce-sentiment-analysis

A SaaS-style backend that analyzes e-commerce product reviews using sentiment analysis, built with Node.js, TypeScript, Express, and MySQL. It includes JWT authentication and integrates with LLM providers (OpenAI or Gemini) for sentiment classification.

## Features
- Register/login with hashed passwords (bcrypt) and JWT auth
- Product analysis endpoint that fetches reviews (mock), calls LLM for sentiment, saves results
- Dashboard summary for a user's recent analyses
- Sequelize ORM models (User, Product, Review, Analysis)
- Central error handler, CORS, JSON middleware

## Quick start

1. Create .env
```
NODE_ENV=development
PORT=4000
DATABASE_URL=mysql://root:password@localhost:3306/sentiment_db
JWT_SECRET=please_change_me
JWT_EXPIRES_IN=1d
OPENAI_API_KEY=sk-your-key
# Or use Gemini instead of OpenAI
GEMINI_API_KEY=your-gemini-key
LLM_PROVIDER=openai # options: openai|gemini|mock
```

2. Install and run
```
npm install
npm run dev
```

The server starts at http://localhost:4000

## API
- POST /api/auth/register { username, email, password }
- POST /api/auth/login { email, password }
- POST /api/products/analyze { productUrl } (auth required)
- GET  /api/dashboard/summary (auth required)

## Development
- Jest tests using Supertest: `npm test`
- Sequelize will create tables automatically using `sequelize.sync()` at startup in dev.
- For production, run migrations (not included here) or keep `sync({ alter: false })` and manage schema manually.

## Notes
- The product review fetcher is mocked to avoid scraping complexity. Replace with real scraping/API later.
- If no LLM key is set, provider `mock` generates deterministic sentiments for local dev.

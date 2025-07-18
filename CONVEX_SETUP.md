# Convex Local Development Setup

This guide will help you set up Convex for local development with the Vehicle Inspection System.

## Prerequisites

1. **Node.js** (v18 or later)
2. **npm** or **yarn**
3. **Convex CLI** (installed globally)

## Installation Steps

### 1. Install Convex CLI

\`\`\`bash
npm install -g convex
\`\`\`

### 2. Clone and Setup Project

\`\`\`bash
git clone <your-repo-url>
cd vehicle-inspection-system
npm install
\`\`\`

### 3. Initialize Convex

\`\`\`bash
# Initialize Convex in your project
npx convex init

# This will:
# - Create a new Convex project
# - Generate convex/_generated files
# - Set up your NEXT_PUBLIC_CONVEX_URL
\`\`\`

### 4. Configure Environment Variables

\`\`\`bash
# Copy the example environment file
cp .env.local.example .env.local

# Edit .env.local with your values
# The NEXT_PUBLIC_CONVEX_URL will be automatically set by convex init
\`\`\`

### 5. Start Development Servers

Option A: Start both servers separately
\`\`\`bash
# Terminal 1: Start Convex development server
npm run convex:dev

# Terminal 2: Start Next.js development server
npm run dev
\`\`\`

Option B: Start both servers concurrently
\`\`\`bash
# Start both Convex and Next.js together
npm run dev:full
\`\`\`

## Convex Commands

### Development
\`\`\`bash
# Start Convex development server
npm run convex:dev

# Open Convex dashboard
npm run convex:dashboard
\`\`\`

### Deployment
\`\`\`bash
# Deploy to production
npm run convex:deploy
\`\`\`

### Schema Management
\`\`\`bash
# Push schema changes
npx convex dev --once

# Clear all data (development only)
npx convex run --prod clearAllTables
\`\`\`

## Project Structure

\`\`\`
convex/
├── _generated/          # Auto-generated files
├── schema.ts           # Database schema
├── convex.config.ts    # Convex configuration
├── inspections.ts      # Inspection functions
├── vehicles.ts         # Vehicle functions
├── shops.ts           # Shop management
├── users.ts           # User management
├── ai.ts              # AI integration functions
├── pricing.ts         # Pricing calculations
└── workflows.ts       # Background jobs
\`\`\`

## Key Features Enabled

### 1. Multi-tenant Architecture
- Shop-based data isolation
- User role management
- Tenant-specific configurations

### 2. AI Integration
- Ollama vision model integration
- Damage detection and assessment
- RAG-based knowledge retrieval

### 3. Real-time Updates
- Live inspection status updates
- Real-time damage detection results
- Collaborative editing capabilities

### 4. File Storage
- Image upload and processing
- Secure file storage with Convex
- Automatic cleanup and optimization

## Development Workflow

### 1. Schema Changes
\`\`\`bash
# Edit convex/schema.ts
# Changes are automatically applied in development
# For production, run: npm run convex:deploy
\`\`\`

### 2. Adding New Functions
\`\`\`bash
# Create new .ts file in convex/
# Export query, mutation, or action functions
# Functions are automatically available via api object
\`\`\`

### 3. Testing Functions
\`\`\`bash
# Use Convex dashboard to test functions
npm run convex:dashboard

# Or test in your React components
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

const inspections = useQuery(api.inspections.list);
\`\`\`

## Troubleshooting

### Common Issues

1. **"api proxy is a stub" Error**
   - Ensure `npx convex dev` is running
   - Check NEXT_PUBLIC_CONVEX_URL in .env.local

2. **Schema Validation Errors**
   - Check convex/schema.ts for type mismatches
   - Ensure all required fields are defined

3. **Authentication Issues**
   - Verify Clerk configuration
   - Check user role assignments

4. **File Upload Problems**
   - Ensure proper CORS configuration
   - Check file size limits

### Getting Help

1. **Convex Documentation**: https://docs.convex.dev
2. **Discord Community**: https://convex.dev/community
3. **GitHub Issues**: Create issues in the project repository

## Production Deployment

### 1. Deploy Convex Backend
\`\`\`bash
npm run convex:deploy
\`\`\`

### 2. Update Environment Variables
- Set production CONVEX_DEPLOY_KEY
- Configure production environment variables

### 3. Deploy Frontend
- Deploy to Vercel, Netlify, or your preferred platform
- Ensure environment variables are set correctly

## Performance Optimization

### 1. Query Optimization
- Use indexes for frequently queried fields
- Implement pagination for large datasets
- Cache expensive computations

### 2. File Storage
- Optimize image sizes before upload
- Implement automatic cleanup for old files
- Use CDN for static assets

### 3. Background Jobs
- Use Convex workflows for long-running tasks
- Implement proper error handling and retries
- Monitor job performance and failures

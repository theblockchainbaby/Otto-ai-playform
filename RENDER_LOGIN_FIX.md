# Fix Internal Server Error on Sign In - Render Troubleshooting

## Issue
Getting "Internal Server Error" when clicking "Sign In" after "Launch Otto" button on ottoagent.net

## Likely Causes

### 1. Database Not Connected
Your Render environment shows `DATABASE_URL` but the health check showed `"database": "disconnected"`

### 2. No Admin User in Database
The database might be empty - no users created yet

### 3. Prisma Schema Not Applied
Database migrations might not have run on Render

---

## Solution Steps

### Step 1: Check Render Logs

1. Go to https://dashboard.render.com
2. Click on your `otto-ai-playform` service
3. Click **"Logs"** in the left sidebar
4. Look for errors like:
   - `Database connection failed`
   - `PrismaClientInitializationError`
   - `User not found`
   - `Invalid credentials`

### Step 2: Verify Database Migration

Your build command should include Prisma migration. Check if this is in your `package.json`:

**Build Command (should be):**
```bash
npm ci && npx prisma generate && npx prisma migrate deploy
```

**Current build command in Render:**
Check if it's just `npm ci && npx prisma generate` (missing migrate!)

### Step 3: Add Database Migration to Build

1. In Render dashboard, go to **Settings** tab
2. Find **Build Command**
3. Update to:
```bash
npm ci && npx prisma generate && npx prisma migrate deploy
```
4. Click **Save Changes**
5. Trigger manual deploy

### Step 4: Seed the Database with Admin User

After migration, you need to create an admin user. Add this to your build/start process:

**Option A: Add seed script to package.json**
```json
{
  "scripts": {
    "seed": "node prisma/seed.js",
    "postdeploy": "npm run seed"
  }
}
```

**Option B: Run seed manually via Render Shell**
1. In Render dashboard, click **Shell** tab
2. Run:
```bash
npx prisma db seed
```

Or run the seed file directly:
```bash
node seed-production.js
```

### Step 5: Check Environment Variables

Make sure these are set in Render (you have them, just verify values):

- ✅ `DATABASE_URL` - Correct PostgreSQL URL
- ✅ `JWT_SECRET` - For authentication tokens
- ✅ `NODE_ENV` - Should be `production`

---

## Quick Fix: Create Admin User Manually

If the issue is "no users in database", create one via Render Shell:

1. Go to Render dashboard → **Shell** tab
2. Run this command:

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'admin@automotive-ai.com',
      name: 'Admin User',
      role: 'ADMIN',
      passwordHash: hashedPassword,
      organizationId: 'default-org' // Update with actual org ID
    }
  });
  console.log('Admin user created:', user.email);
}

createAdmin().catch(console.error).finally(() => prisma.\$disconnect());
"
```

---

## Check Specific Error in Logs

To see the exact error, check Render logs for:

**Common errors:**
- `PrismaClientKnownRequestError: Invalid prisma.user.findUnique()`
- `Error: User not found`
- `Error: connect ECONNREFUSED` (database not reachable)
- `Error: password comparison failed`

---

## Update Build Command Now

**Recommended Build Command for Render:**
```bash
npm ci && npx prisma generate && npx prisma migrate deploy && node seed-production.js
```

This will:
1. Install dependencies
2. Generate Prisma client
3. Run database migrations
4. Seed the database with initial data

---

## Test Login Credentials

After fixing, try logging in with:

**Email**: `admin@automotive-ai.com`
**Password**: (whatever you set in seed file, likely `admin123` or check `seed-production.js`)

---

## Next Steps

1. **Check Render logs** - Find the exact error
2. **Update build command** - Add migrations
3. **Seed database** - Create admin user
4. **Test login** - Try signing in again

**Share the error from Render logs if you still have issues!**

# PIGEYAN — SECURITY ARCHITECTURE
# Save this file as: pigeyan-docs/PIGEYAN-SECURITY.md
# Read this before writing any code that touches data, auth, or APIs.
# These rules are non-negotiable. Never break them.

---

## YOUR SECURITY RESPONSIBILITY

You are building a product that reads confidential client emails
and stores sensitive business data. Agency owners are trusting
Pigeyan with their most important business relationships.

One security mistake can destroy that trust permanently.
There are no excuses for breaking these rules.
When in doubt — do the more secure thing. Always.

---

## RULE 1 — NEVER HARDCODE SECRETS

This is the single most common and most damaging mistake junior
developers make. A hardcoded API key committed to GitHub is
compromised the moment it is pushed. Bots scan GitHub 24/7
specifically looking for exposed keys.

NEVER do this:
```typescript
// WRONG — NEVER DO THIS
const openai = new OpenAI({ apiKey: "sk-proj-abc123..." });
const supabase = createClient("https://xyz.supabase.co", "eyJhbGc...");
```

ALWAYS do this:
```typescript
// CORRECT — ALWAYS DO THIS
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

ALL secrets live in .env.local only.
.env.local is in .gitignore. It never gets committed. Ever.
On Vercel, secrets are set as environment variables in the dashboard.

---

## RULE 2 — ENVIRONMENT VARIABLES STRUCTURE

These are the only environment variables Pigeyan uses.
No others. No extras. No shortcuts.

```
# .env.local — never commit this file

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Google OAuth (for Gmail)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Microsoft OAuth (for Outlook)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# App
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

NEXT_PUBLIC_ prefix means the variable is safe to expose
to the browser. Only Supabase URL and anon key get this prefix.
Everything else is server-side only. Never prefix sensitive
keys with NEXT_PUBLIC_.

SUPABASE_SERVICE_ROLE_KEY is used ONLY in server-side
Edge Functions and API routes. Never in client-side code. Ever.

---

## RULE 3 — ROW LEVEL SECURITY IS MANDATORY

Every database query must be scoped to the logged-in agency.
An agency can only ever read and write their own data.
This is enforced at the database level via RLS policies.

After creating any new table, immediately add RLS policies.
No exceptions.

Standard RLS policy pattern for every table:

```sql
-- Enable RLS
alter table table_name enable row level security;

-- Agency can only see their own rows
create policy "Agency sees own data"
on table_name for select
using (agency_id = auth.uid());

-- Agency can only insert their own rows
create policy "Agency inserts own data"
on table_name for insert
with check (agency_id = auth.uid());

-- Agency can only update their own rows
create policy "Agency updates own data"
on table_name for update
using (agency_id = auth.uid());

-- Agency can only delete their own rows
create policy "Agency deletes own data"
on table_name for delete
using (agency_id = auth.uid());
```

Without RLS — Agency A could access Agency B's client data.
That is a catastrophic breach. RLS prevents this at the
database level regardless of what the application code does.

---

## RULE 4 — OAUTH TOKENS MUST BE ENCRYPTED

When an agency connects Gmail or Outlook, we receive an
OAuth access token and refresh token. These tokens allow
us to read their email. They are as sensitive as a password.

NEVER store OAuth tokens as plain text in the database.

ALWAYS encrypt them before storing:

```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 char key
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

Add ENCRYPTION_KEY to .env.local — a random 32 character string.
Never the same key in development and production.

---

## RULE 5 — API ROUTES ARE SERVER SIDE ONLY

All calls to OpenAI, Gmail API, Outlook API, and Supabase
service role must happen in API routes or server components.
Never in client-side code.

WRONG — exposing API call in client component:
```typescript
// WRONG — API key exposed to browser
const response = await fetch('https://api.openai.com/v1/...', {
  headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
});
```

CORRECT — API call in server-side API route:
```typescript
// app/api/generate-narrative/route.ts
// This runs on the server. Browser never sees the API key.
export async function POST(request: Request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // ... rest of logic
}
```

Structure all AI calls, email reads, and sensitive operations
as Next.js API routes under app/api/. Client components call
these routes. They never call external APIs directly.

---

## RULE 6 — GMAIL AND OUTLOOK SCOPE IS READ ONLY

When requesting OAuth permissions for Gmail and Outlook,
request the absolute minimum scope required. Nothing more.

Gmail scope:
```
https://www.googleapis.com/auth/gmail.readonly
```

Outlook scope:
```
Mail.Read
```

These scopes allow reading email only.
We cannot send. We cannot delete. We cannot modify.
This must be communicated clearly to the user on the
consent screen and in the privacy policy.

Never request broader scopes than necessary.
If a feature can be built with readonly — use readonly.

---

## RULE 7 — VALIDATE ALL AI OUTPUT

OpenAI returns JSON. Sometimes it returns malformed JSON.
Sometimes it hallucinates fields. Sometimes it returns
plain text instead of JSON.

Never trust AI output blindly. Always validate.

```typescript
// lib/ai/validate.ts
export function validateNarrativeOutput(raw: unknown): NarrativeOutput {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

    // Check required fields exist
    if (!parsed.narrative || typeof parsed.narrative !== 'string') {
      throw new Error('Invalid narrative field');
    }
    if (!Array.isArray(parsed.key_points)) {
      throw new Error('Invalid key_points field');
    }
    if (typeof parsed.confidence !== 'number') {
      throw new Error('Invalid confidence field');
    }

    return parsed as NarrativeOutput;
  } catch (error) {
    // Log the error, return a safe fallback
    console.error('AI output validation failed:', error);
    throw new Error('AI returned invalid output. Please try again.');
  }
}
```

Every AI response goes through a validator before being
stored in the database or shown to the user.

---

## RULE 8 — INPUT SANITISATION

Never trust user input. Sanitise everything before storing
or processing.

```typescript
// lib/sanitise.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitiseText(input: string): string {
  // Remove HTML tags and dangerous characters
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
}

export function sanitiseEmail(input: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleaned = input.toLowerCase().trim();
  if (!emailRegex.test(cleaned)) {
    throw new Error('Invalid email format');
  }
  return cleaned;
}
```

Apply sanitisation to all user-provided text before
storing in database or sending to AI.

---

## RULE 9 — ERROR HANDLING NEVER EXPOSES INTERNALS

Error messages shown to users must never reveal:
- Database structure
- API keys or tokens
- Internal file paths
- Stack traces
- SQL queries

WRONG:
```typescript
// WRONG — exposes internal details
catch (error) {
  return Response.json({ error: error.message }); 
  // Could expose: "duplicate key value violates unique constraint agencies_email_key"
}
```

CORRECT:
```typescript
// CORRECT — safe generic message to user, full error logged server side
catch (error) {
  console.error('Database error:', error); // Full error in server logs only
  return Response.json({ error: 'Something went wrong. Please try again.' });
}
```

Always log full errors server-side.
Always return safe generic messages to the client.

---

## RULE 10 — RATE LIMITING ON API ROUTES

Every API route that calls OpenAI or processes emails
must have rate limiting to prevent abuse and runaway costs.

```typescript
// Simple rate limiting using Supabase
// Check how many requests this agency has made in the last hour
const { count } = await supabase
  .from('api_usage')
  .select('*', { count: 'exact' })
  .eq('agency_id', agencyId)
  .gte('created_at', new Date(Date.now() - 3600000).toISOString());

if (count && count > 50) {
  return Response.json(
    { error: 'Rate limit exceeded. Please try again later.' },
    { status: 429 }
  );
}
```

This prevents a single agency from accidentally or
maliciously making thousands of AI calls and running
up costs.

---

## RULE 11 — .GITIGNORE MUST INCLUDE THESE

Verify .gitignore contains all of these before first commit:

```
# Environment variables — NEVER commit these
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Dependencies
node_modules/

# Build output
.next/
out/

# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/

# Logs
*.log
npm-debug.log*
```

Before every commit, verify no .env files are staged.
If you ever accidentally commit a secret — rotate it
immediately. The exposed key is compromised regardless
of whether you delete the commit.

---

## RULE 12 — HTTPS EVERYWHERE

Never allow HTTP connections in production.
Vercel enforces HTTPS automatically.
All API calls to external services use HTTPS endpoints only.
Never construct HTTP URLs for external services.

---

## SECURITY CHECKLIST — RUN BEFORE EVERY DEPLOY

Before deploying any code to production, verify:

- [ ] No hardcoded secrets anywhere in codebase
- [ ] All new tables have RLS enabled and policies created
- [ ] OAuth tokens encrypted before database storage
- [ ] All AI outputs validated before use
- [ ] All user inputs sanitised before storage
- [ ] Error messages are generic to users, detailed in logs
- [ ] .env.local not committed to GitHub
- [ ] API routes handle rate limiting
- [ ] No console.log statements exposing sensitive data

---

## WHAT WE TELL AGENCIES — THE TRUST CONTRACT

Every agency that connects their email to Pigeyan must
understand and agree to this:

1. We request read-only access to email. We cannot send,
   delete, or modify any email. Ever.

2. Email data is used solely to build client intelligence
   within their own Pigeyan account. It is never shared
   with other agencies.

3. We never sell data. We never share data with third parties
   except the AI provider (OpenAI) which processes it to
   generate intelligence. OpenAI does not train on API data.

4. The agency can revoke email access at any time from their
   Google or Microsoft account settings.

5. The agency can delete all their data from Pigeyan at any time.

6. All data is encrypted at rest and in transit.

This is not just a legal requirement. It is the foundation
of the trust that makes Pigeyan valuable.

---

## SUMMARY — THE NON-NEGOTIABLE RULES

1. No hardcoded secrets. Ever.
2. All secrets in .env.local only.
3. RLS on every table. No exceptions.
4. OAuth tokens encrypted at rest.
5. All AI calls server-side only.
6. Gmail and Outlook read-only scope only.
7. Validate all AI output before use.
8. Sanitise all user input before storage.
9. Generic errors to users, detailed errors in logs.
10. Rate limit all AI API routes.
11. .gitignore covers all environment files.
12. HTTPS everywhere.

---

*End of PIGEYAN-SECURITY.md*
*Senior Developer: Jarvis*
*Security is not optional. It is the product.*

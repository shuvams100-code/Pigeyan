# PIGEYAN — TECHNICAL ARCHITECTURE
# Save this file as: pigeyan-docs/PIGEYAN-ARCHITECTURE.md
# You are the junior developer. Read this completely.
# Build exactly what is written here. Nothing more. Nothing less.

---

## YOUR ROLE

You are the junior developer on this project.
I am the senior developer. I have designed everything.
Your job is to execute precisely what is written in these documents.
When in doubt — re-read the documents. Do not invent. Do not assume.
Always refer to PIGEYAN.md, PIGEYAN-FEATURES.md, and this file
before writing a single line of code.

---

## TECH STACK — FIXED. DO NOT CHANGE.

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Hosting | Vercel |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| AI Engine | OpenAI API — gpt-4o-mini |
| Gmail Integration | Google OAuth 2.0 + Gmail API (read-only) |
| Outlook Integration | Microsoft OAuth 2.0 + Graph API (read-only) |
| File Storage | Supabase Storage |
| File Processing | PDF.js + OpenAI Vision API |
| Background Jobs | Supabase Edge Functions |
| Realtime | Supabase Realtime |
| Styling | Tailwind CSS |

---

## CORE COMPONENTS — THE BUILDING BLOCKS

There are 6 core components. Every feature in Pigeyan
is built on top of these 6. Build them in this order.
Do not skip. Do not reorder.

### COMPONENT 1 — AUTH LAYER
Handles agency signup, login, logout, and session management.
Built on Supabase Auth. Every other component depends on this.
Nothing works without a logged-in agency user.

### COMPONENT 2 — DATA LAYER (DATABASE)
All Supabase tables. The schema is defined below.
This must exist before any data can be read or written.
Build all tables at once in Week 1.

### COMPONENT 3 — INTEGRATION LAYER
Connects Pigeyan to external data sources.
Gmail OAuth + Gmail API read-only.
Outlook OAuth + Microsoft Graph API read-only.
Analytics platform connections (Google Analytics, Google Ads, Meta Ads).
This layer pulls raw data in. Everything downstream depends on it.

### COMPONENT 4 — LOFT ENGINE
The AI intelligence layer. The brain.
Takes raw data from the Integration Layer.
Processes it through OpenAI API.
Extracts signals, patterns, sentiment, memory.
Stores structured intelligence in loft_memory table.
Updates continuously as new data arrives.
Everything the user sees is powered by LOFT output.

### COMPONENT 5 — PORTFOLIO SCAN ENGINE
Runs every 24 hours via Supabase Edge Function.
Reads all loft_memory records for an agency.
Identifies patterns across the entire client roster.
Generates reminders and portfolio insights.
Writes results to reminders and portfolio_insights tables.
Powers the Morning Clarity dashboard experience.

### COMPONENT 6 — NARRATIVE ENGINE
Called on demand when agency requests a client update.
Pulls: client loft_memory + recent emails + artifacts content.
Sends all context to OpenAI API with a structured prompt.
OpenAI returns a plain English narrative draft.
Draft stored in updates table with status = draft.
Agency reviews, edits, approves.
Status updated to approved. Agency copies and sends manually.

---

## DATA FLOW — HOW EVERYTHING CONNECTS

### ONBOARDING FLOW
```
Agency signs up (Auth Layer)
→ Agency connects Gmail or Outlook (Integration Layer)
→ System pulls 12 months of email history
→ Emails stored in emails table
→ LOFT Engine processes every email
→ Extracts signals per client
→ Builds initial loft_memory profile per client
→ Agency sees populated dashboard on first login
```

### DAILY SYNC FLOW
```
Every 2 hours:
Gmail / Outlook sync runs (Integration Layer)
→ New emails detected per client
→ Stored in emails table
→ LOFT Engine processes new emails
→ Updates loft_memory for affected clients
→ Updates health_status on clients table
→ Triggers reminder checks
```

### 24 HOUR PORTFOLIO SCAN
```
Every 24 hours (Supabase Edge Function):
Portfolio Scan Engine reads all clients for agency
→ Checks each client against pattern rules:
   - No reply in 14+ days → at_risk reminder
   - Sentiment declining 3 months → at_risk reminder
   - Update overdue 30+ days → update_due reminder
   - Positive sentiment trend → opportunity reminder
→ Writes new records to reminders table
→ Writes portfolio-level insights to portfolio_insights table
→ Dashboard updates in real time via Supabase Realtime
```

### NARRATIVE GENERATION FLOW
```
Agency clicks Generate Update on client profile
→ System gathers:
   - loft_memory for this client
   - Last 30 days emails for this client
   - All artifacts for this client uploaded this month
   - Portfolio context (how client compares to others)
→ All context structured into OpenAI API prompt
→ OpenAI returns narrative draft as JSON
→ Draft stored in updates table (status = draft)
→ Agency sees draft in review screen
→ Agency edits if needed
→ Agency clicks Approve
→ Status updated to approved
→ Agency copies text and sends from own email
```

### ARTIFACT PROCESSING FLOW
```
Agency drops file into client artifacts folder
→ File uploaded to Supabase Storage
→ Record created in artifacts table
→ File type detected:
   - PDF → PDF.js extracts text
   - Image / Screenshot → OpenAI Vision extracts content
   - CSV / Excel → Parse and structure data
   - Any other → OpenAI reads raw content
→ Extracted content stored in artifacts.extracted_content
→ LOFT Engine reads extracted content
→ Updates loft_memory for that client
→ Artifact marked processed_by_loft = true
```

---

## DATABASE SCHEMA — BUILD EXACTLY AS WRITTEN

### agencies
```sql
id              uuid primary key default gen_random_uuid()
name            text not null
email           text not null unique
plan            text default 'starter'
gmail_token     text
outlook_token   text
created_at      timestamp default now()
```

### clients
```sql
id                    uuid primary key default gen_random_uuid()
agency_id             uuid references agencies(id) on delete cascade
name                  text not null
company               text
industry              text
email                 text
phone                 text
health_status         text default 'green'
last_interaction_at   timestamp
next_action_at        timestamp
created_at            timestamp default now()
```

### loft_memory
```sql
id                          uuid primary key default gen_random_uuid()
client_id                   uuid references clients(id) on delete cascade
agency_id                   uuid references agencies(id) on delete cascade
communication_style         text
key_topics                  text[]
emotional_patterns          text[]
sentiment_trend             jsonb
language_preferences        text
anxiety_triggers            text[]
positive_triggers           text[]
relationship_health_score   integer default 50
raw_memory_json             jsonb
last_updated_at             timestamp default now()
```

### emails
```sql
id                  uuid primary key default gen_random_uuid()
client_id           uuid references clients(id) on delete cascade
agency_id           uuid references agencies(id) on delete cascade
direction           text not null
subject             text
body                text
sentiment_score     numeric
key_signals         text[]
processed_by_loft   boolean default false
sent_at             timestamp
read_at             timestamp
replied_at          timestamp
```

### artifacts
```sql
id                  uuid primary key default gen_random_uuid()
client_id           uuid references clients(id) on delete cascade
agency_id           uuid references agencies(id) on delete cascade
file_name           text not null
file_type           text
file_url            text
extracted_content   text
processed_by_loft   boolean default false
uploaded_at         timestamp default now()
```

### updates
```sql
id                  uuid primary key default gen_random_uuid()
client_id           uuid references clients(id) on delete cascade
agency_id           uuid references agencies(id) on delete cascade
draft_content       text
final_content       text
status              text default 'draft'
client_opened       boolean default false
client_replied      boolean default false
created_at          timestamp default now()
sent_at             timestamp
```

### reminders
```sql
id                  uuid primary key default gen_random_uuid()
client_id           uuid references clients(id) on delete cascade
agency_id           uuid references agencies(id) on delete cascade
type                text not null
message             text
priority            text default 'medium'
status              text default 'active'
due_at              timestamp
created_at          timestamp default now()
```

### portfolio_insights
```sql
id                  uuid primary key default gen_random_uuid()
agency_id           uuid references agencies(id) on delete cascade
insight_type        text
insight_content     text
affected_clients    text[]
priority            text default 'medium'
dismissed_at        timestamp
created_at          timestamp default now()
```

---

## AI PROMPT STRUCTURE — EVERY OPENAI API CALL

Every call to OpenAI API follows this structure.
Never deviate from this structure.

```
SYSTEM PROMPT:
You are LOFT, the client intelligence engine inside Pigeyan.
You think like a senior account manager with 20 years of 
experience in professional services. You are precise, 
empathetic, and always focused on what serves the client 
relationship best. You always return structured JSON.
Never return plain text. Always return valid JSON only.

CONTEXT BLOCK:
{
  "agency": { name, industry },
  "client": { name, company, industry, relationship_length },
  "loft_memory": { full memory profile object },
  "recent_emails": [ last 30 days email summaries ],
  "artifacts": [ extracted content from uploaded files ],
  "portfolio_context": { how this client compares to others },
  "task": "generate_update | extract_signals | scan_portfolio | suggest_reply"
}

OUTPUT FORMAT PER TASK:

generate_update returns:
{
  "narrative": "plain english update text",
  "key_points": ["point 1", "point 2", "point 3"],
  "anticipated_questions": ["question 1", "question 2"],
  "confidence": 0.0 to 1.0
}

extract_signals returns:
{
  "sentiment_score": -1.0 to 1.0,
  "key_signals": ["signal 1", "signal 2"],
  "anxiety_triggers_detected": ["trigger 1"],
  "positive_triggers_detected": ["trigger 1"],
  "memory_updates": { fields to update in loft_memory }
}

scan_portfolio returns:
{
  "at_risk_clients": [{ client_id, reason, priority }],
  "opportunity_clients": [{ client_id, reason }],
  "overdue_updates": [{ client_id, days_overdue }],
  "portfolio_insight": "one key observation across all clients"
}

suggest_reply returns:
{
  "suggested_reply": "plain english reply text",
  "tone": "reassuring | informative | celebratory | neutral",
  "key_points_addressed": ["point 1", "point 2"]
}
```

---

## DESIGN SYSTEM — FOLLOW EXACTLY

```
Background:     #FFFFFF (white main content)
Sidebar:        #0F172A (dark navy)
Brand primary:  #0D7377 (deep teal)
Brand hover:    #0A5C60
Text primary:   #1E293B
Text secondary: #64748B
Border:         #E2E8F0
Success green:  #16A34A
Warning amber:  #D97706
Danger red:     #DC2626

Health indicators:
  Green  = #16A34A  (healthy)
  Amber  = #D97706  (needs attention)
  Red    = #DC2626  (at risk)

Font: Inter
Border radius: 8px standard, 12px cards
Shadow: 0 1px 3px rgba(0,0,0,0.1)
```

---

## BUILD ORDER — 6 WEEKS. DO NOT SKIP AHEAD.

### WEEK 1 — FOUNDATION
- Next.js 14 project initialised with App Router
- Supabase project connected
- All database tables created exactly per schema above
- Supabase Auth configured
- Signup page, login page, logout
- Protected routes (redirect to login if not authenticated)
- Dashboard shell — dark sidebar, white content area
- Sidebar navigation: Dashboard, Clients, Reports, Settings
- Client list page — add, edit, view, delete clients
- Basic client profile page shell

Stop here. Test auth and client management fully.
Come back for Week 2 instructions.

### WEEK 2 — EMAIL INTEGRATION
- Gmail OAuth 2.0 connection (read-only scope)
- Outlook OAuth 2.0 connection (read-only scope)
- Historical email import — 12 months per client
- Store in emails table
- Basic email list view per client profile

Stop here. Test email connection and import fully.
Come back for Week 3 instructions.

### WEEK 3 — LOFT CORE
- OpenAI API integrated
- Email processing pipeline
- extract_signals prompt implemented
- loft_memory records created per client
- Client profile page shows LOFT memory panel
- Memory updates when new emails arrive

Stop here. Test LOFT memory building fully.
Come back for Week 4 instructions.

### WEEK 4 — INTELLIGENCE LAYER
- Portfolio Scan Edge Function (24 hour schedule)
- scan_portfolio prompt implemented
- Reminders table populated from scan results
- Portfolio insights generated
- Dashboard Morning Clarity section built
- Health status colours updating on client list

Stop here. Test portfolio scan and reminders fully.
Come back for Week 5 instructions.

### WEEK 5 — USER FACING FEATURES
- Artifacts upload — file drop per client
- Artifact processing pipeline
- generate_update prompt implemented
- Monthly update generation flow
- Review and edit screen
- suggest_reply implemented
- Reports page

Stop here. Test all user facing features fully.
Come back for Week 6 instructions.

### WEEK 6 — POLISH AND LAUNCH
- Onboarding flow polish
- Empty states for all screens
- Error handling everywhere
- Loading states
- Mobile responsive check
- Final testing with real data
- Deploy to Vercel production

---

## RULES YOU MUST NEVER BREAK

1. Build in week order. Never jump ahead.
2. Auth and database before any AI features.
3. Every OpenAI API response must be valid JSON.
   Validate before storing or displaying.
4. Email access is read-only. Never write to email.
5. Encrypt OAuth tokens at rest in database.
6. Agency always reviews before anything reaches client.
7. Never auto-send anything to a client. Ever.
8. No features outside this document in MVP.
9. Test each week completely before moving forward.
10. When lost — re-read PIGEYAN.md first.

---

*End of PIGEYAN-ARCHITECTURE.md*
*Senior Developer: Jarvis*
*Junior Developer: You (Antigravity)*
*Build with precision. Build with care.*

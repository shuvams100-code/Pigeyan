# Pigeyan — AI-Powered Client Intelligence Platform

## Permanent Reference Document

---

## 1. The Core Problem

Professional service firms — marketing agencies, consulting firms, accounting firms, law firms, HR firms — anyone managing ongoing client relationships faces one painful, universal problem. They spend hours every month trying to communicate results to clients in a way clients actually understand.

Clients don't read dashboards. Clients don't trust data dumps. They want to know **what happened, why it matters, and what comes next.**

Every tool in the market today solves the data problem. Nobody has solved the communication and trust problem. That is the gap Pigeyan fills.

---

## 2. The Solution: Pigeyan

Pigeyan is an AI-powered client intelligence platform. It acts as an intelligent translation layer between the agency's work and the client's understanding. It shifts the paradigm from "data reporting" to "relationship storytelling," solving both the communication and trust problem simultaneously.

It connects to the agency's data sources and email. It reads everything. It builds a living memory profile for every client over time. When the agency needs to update a client, Pigeyan generates a plain English narrative — not a dashboard, not a data dump — that the agency reviews, edits, and sends from their own email.

---

## 3. Data & Context Ingestion

Professional service firms generate data in two places.

### 3.1 Performance Platforms (Structured Data)

The first source is performance platforms. The specific platforms depend on the type of firm:

- **Marketing agencies:** Google Analytics, Google Ads, Meta Ads, LinkedIn Ads
- **Consulting firms:** Project trackers, financial reports, deliverable documents
- **Accounting firms:** Financial data exports

The agency connects these platforms to Pigeyan. This provides the structured, quantitative data layer.

### 3.2 Artifacts (Unstructured Data)

Beyond structured platform data, agencies deal with unstructured data constantly. A client sends a PDF report. Someone exports a spreadsheet. There's a screenshot of results. A presentation deck.

Pigeyan handles this through an **artifacts system**. Every client has their own folder inside Pigeyan. The agency can drop anything into that folder — any file format, any structure, messy or clean. Pigeyan reads it all and extracts what matters.

### 3.3 Email (Relationship Data)

The second major data source is email. The agency connects their Gmail or Outlook via **read-only OAuth**. Pigeyan reads the full history of every conversation with every client.

The purpose is not to store emails. It is to **understand the relationship:**

- What has this client complained about before?
- What do they celebrate?
- How do they communicate when they are happy versus anxious?
- What topics come up repeatedly?

This email history combined with the performance data gives LOFT its initial foundation.

---

## 4. The LOFT Memory Engine

LOFT is the brain of Pigeyan. It does not just store data. It builds **understanding**.

Think of it like a senior account manager who has worked with a client for three years. They know things that aren't written anywhere. They know one client panics when leads drop even slightly. They know another client only cares about revenue, never impressions. They know one client responds well to directness and another needs reassurance before bad news. LOFT builds this kind of knowledge automatically by reading patterns across all available data over time.

### 4.1 What LOFT Tracks

LOFT maintains a **living profile** per client. It tracks:

- **Communication style** — Is this client formal or casual? Brief or detailed? Emotional or analytical?
- **Key topics** — What metrics does this client always ask about? What projects do they reference? What concerns come up repeatedly?
- **Emotional patterns** — When does sentiment drop? What triggers anxiety? What creates positive responses?
- **Sentiment trend over time** — Is this relationship getting stronger or weaker month by month?
- **What language works** — Which phrases land well? Which create confusion or concern?

### 4.2 Temporal Intelligence

Critically, LOFT does **not** treat each month as isolated. It connects patterns across months and years.

- If a client got nervous about budget in Q4 last year, LOFT remembers that and flags it proactively this Q4.
- If a client always asks about a specific metric, LOFT ensures that metric is always addressed first in their update.

The profile grows more accurate and more useful every single month.

---

## 5. The 24-Hour Portfolio Scan

Every agency has too many clients to give equal attention to all of them every day. Things fall through the cracks. A client goes quiet and the agency doesn't notice until it's too late. An opportunity to upsell emerges but nobody spotted the signals. A relationship that could have been saved with one proactive email instead churns.

### 5.1 What the Scan Does

LOFT runs a full scan across **every client in the portfolio every 24 hours**. It is not looking at isolated data points. It is looking at **patterns and trajectories**. It asks questions like:

- Has this client's response time increased, suggesting disengagement?
- Has sentiment been declining for three consecutive months?
- Has this client not received an update in longer than usual?
- Has this client been sending positive signals that suggest they're ready to expand the relationship?

### 5.2 The Output: A Prioritised Action List

The output of this scan is not a report. It is a **prioritised action list** that surfaces on the agency's dashboard every morning:

- This client needs a follow-up today.
- This client is at risk — and here is why.
- This client is showing expansion signals.
- This client has an overdue update.

The agency arrives at work already knowing exactly where to focus their relationship energy that day.

---

## 6. Narrative Generation

### 6.1 The Traditional Pain

When an agency needs to send a monthly update to a client, the traditional process is painful. Pull data from multiple platforms. Clean and structure it. Figure out what to highlight. Write something that makes sense to a non-technical client. Make it sound human. Make it sound like you actually care. This takes hours and the result is often still a data dump the client does not fully absorb.

### 6.2 Pigeyan's Approach: Client-First, Data-Second

Pigeyan approaches narrative generation completely differently. **It does not start with the data. It starts with the client.**

Before generating a single word, Pigeyan pulls the full LOFT profile for that client. It knows:

- What this specific person cares about
- Their anxiety triggers
- Their communication preferences
- What has happened in the relationship historically

Only then does it layer in the performance data and the artifacts from that month.

### 6.3 The Result

The result is not a generic AI summary. It is a narrative written specifically for this client:

- In **language that works for them**
- Addressing **what they actually care about**
- Anticipating **the questions they are likely to ask** before they ask them
- Explaining what happened in **plain English**
- Contextualising **why it matters specifically to their business**
- Telling them clearly **what comes next**

It is concise. It does not waste their time. It reads like it was written by someone who knows them well.

---

## 7. Human-in-the-Loop Delivery

**Pigeyan never sends anything to a client automatically. Ever.** The agency is always in control. This is deliberate and important.

### 7.1 The Workflow

1. The AI generates a draft narrative.
2. The agency reads it.
3. They may add something only they know — a personal detail from a recent call, a reference to something the client mentioned, their own voice and relationship warmth.
4. They may adjust the tone or change a detail.
5. They copy the final version and send it from **their own email address**.

To the client, it feels like a deeply considered, personally crafted message from their account manager. Not an automated report. Not a template. A human communication that happens to be powered by intelligence the agency could never have assembled manually.

### 7.2 Why This Matters

This human-in-the-loop approach means the agency builds trust in the system **gradually**. They are never blindly trusting AI to speak to their clients. They are using AI to do the preparation so they can focus entirely on the relationship layer that only a human can provide.

---

## 8. The Competitive Moat: The Portfolio View

Every competitor — Gemini, Copilot, ChatGPT — sees **one conversation at a time**. Pigeyan sees **every client, every pattern, all history, all at once**.

This structural advantage allows for insights across the entire agency-client ecosystem. It enables the 24-hour portfolio scan. It enables cross-client pattern recognition. It enables proactive relationship management at scale.

**That position does not exist in the market today.**

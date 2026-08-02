# AI Data Usage Disclosure

**Draft status:** FIRST DRAFT for human/legal review. Grounded in actual codebase behavior (`ai.service.ts`). Must be reviewed by a qualified lawyer before publication.

**Effective date:** [PLACEHOLDER — to be set by business owner]

---

## 1. Overview

SpiceGarden uses artificial intelligence to power:
- A customer support chatbot
- Product recommendations
- Demand forecasting
- Dynamic pricing
- Route optimization
- Semantic search (RAG)

This disclosure describes what data is collected, processed, or sent to AI service providers.

---

## 2. What Data Is Sent to AI Providers

### 2.1 Chatbot (`POST /ai/chatbot`)
- **Endpoint:** `ai.controller.ts:15-19` → `AiService.chatbotResponse()` → `callOpenAI()` (`ai.service.ts:233-295`)
- **Data sent to OpenAI:** The user's message text + a system prompt ("You are SpiceGarden's customer support assistant...").
- **System prompt:** `ai.service.ts:262-270` (hardcoded, not user data)
- **Data NOT included:** User ID, order history, preferences — only the raw message text and system prompt.
- **Max tokens:** 200 (`ai.service.ts:284`)
- **Temperature:** 0.7 (`ai.service.ts:285`)

### 2.2 Embeddings (`POST /ai/embedding`)
- **Endpoint:** `ai.controller.ts:26-30` → `AiService.generateEmbedding()` → `ai.service.ts:308-350`
- **Data sent to OpenAI:** The text input for embedding generation.
- **Model:** `text-embedding-3-small` (default, configurable via `OPENAI_EMBEDDING_MODEL`)

### 2.3 RAG Documents (`POST /ai/rag/document`)
- **Endpoint:** `ai.controller.ts:38-42` → `AiService.addRAGDocument()` → `ai.service.ts:437-470`
- **Data:** Document content, source, metadata stored in-memory (`ragDocuments` array, `ai.service.ts:66`).
- **To OpenAI:** Content is sent for embedding generation (see 2.2).
- **Not persisted:** RAG documents exist only in process memory. Lost on restart.

### 2.4 Context Memory (`POST /ai/context-memory`)
- **Endpoint:** `ai.controller.ts:44-48` → `AiService.addContextMemory()` → `ai.service.ts:499-508`
- **Data:** Session ID, role (user/assistant), content string.
- **Storage:** In-process `Map<string, ChatMessage[]>` (`ai.service.ts:67`), max 20 messages per session.
- **To third parties:** Not sent to OpenAI unless included in a subsequent chatbot call.
- **Persisted:** No — stored in RAM only. Cleared on process restart.

---

## 3. What Data Is NOT Sent to AI Providers

| Data Category | Sent to OpenAI? | Evidence |
|---|---|---|
| User ID / email / phone | No | `ai.service.ts:261-295` — only `message` and `systemPrompt` sent |
| Order history | No | `getRecommendations()` (`ai.service.ts:86-125`) queries local DB, does not call OpenAI |
| Payment info | No | Not referenced in any AI service method |
| Location data | No | Not referenced in any AI service method |
| Auth tokens | No | Not referenced in any AI service method |
| Full conversation context | No (context memory stays in-process) | `ai.service.ts:67` — context memory is a local Map |

---

## 4. AI Service Configuration

| Parameter | Value | Source |
|-----------|-------|--------|
| Model | `gpt-4o-mini` | `ai.service.ts:78` (`OPENAI_API_KEY`) |
| Embedding model | `text-embedding-3-small` | `ai.service.ts:79` |
| Fallback models | `gpt-4o`, `gpt-3.5-turbo` | `ai-control-plane.service.ts:63-67` |
| Max request tokens | 1,000 | `ai-control-plane.service.ts:52` |
| User token budget (per minute) | 20,000 | `ai-control-plane.service.ts:52` |
| User token budget (per hour) | 60,000 | `ai-control-plane.service.ts:52` |
| Request timeout | 15,000 ms | `ai-control-plane.service.ts:43` |
| Hallucination detection | Enabled (pattern + keyword matching) | `ai-control-plane.service.ts:34-41, 108-124` |

---

## 5. AI Call Logging

AI calls are logged for monitoring (not for training):
- `ai-control-plane.service.ts:234-245` — logs template ID, version, model, token usage, user ID
- `metrics.service.ts` — increments `ai_call` counter and records durations
- **No message content is logged.**

---

## 6. Token Budgets & Abuse Prevention

- Per-user token budgets: 20K/min, 60K/hour (`ai-control-plane.service.ts:52-55`)
- Rate limits prevent abuse: tokens are counted per-user minute and hour buckets (`ai-control-plane.service.ts:78-106`)

---

## 7. AI Data Retention

- **Context memory:** In-memory only (RAM), max 20 messages/session, cleared on restart. **Not retained.**
- **RAG documents:** In-memory only. **Not retained.**
- **AI call logs:** Metrics/usage logs retained per operational metrics retention (not PII).
- **OpenAI API data:** Subject to OpenAI's retention policy. API calls via `https://api.openai.com` transmit data to OpenAI's servers. No training data retention opt-out is currently configured (OpenAI's default API usage terms apply).

**Note:** If OpenAI's API is enabled in production, ensure the OpenAI Data Processing Agreement and any training opt-out clauses are reviewed with legal counsel.

---

## 8. Opt-Out

AI features can be disabled entirely via configuration:
- `OPENAI_API_KEY` not set → chatbot falls back to rule-based responses (`ai.service.ts:241, 309-313`)
- `RAG_ENABLED=false` → semantic search disabled (`ai.service.ts:356-361`)
- `VECTOR_DB_ENABLED=false` → no external vector DB calls (`ai.service.ts:80`)

---

## Code Evidence

- `ai.service.ts:59-67` — In-memory storage of context memory and RAG documents
- `ai.service.ts:261-295` — `callOpenAI()` sends only message + system prompt
- `ai.service.ts:318-328` — `generateEmbedding()` sends only text input
- `ai-control-plane.service.ts:182` — API key loaded from config
- `ai-control-plane.service.ts:234-245` — AI call logging (no message content)
- `ai.controller.ts:1-67` — Public endpoints for AI features

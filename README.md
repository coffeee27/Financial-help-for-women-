## Tijori - The safe she controls

A voice-first financial coach for 200+ million Indian women locked out of their own accounts — not by a smartphone gap, but by a household one.

Tijori gives a woman a private view of her own money, a savings ledger her household can't see or drain, and a coach that speaks Hindi. Built on real Indian financial infrastructure: Account Aggregator for consented data, and UPI Circle for delegated savings limits.

Say मेरी बचत कितनी है to hear your balance. Say दो सौ बचाओ to save ₹200. Enter the duress PIN and the whole app quietly shows something else.

## The Problem

For many women, the barrier to financial agency is not literacy. It is control.

- **Dormant by design, not by choice:** 4.93 crore Jan Dhan accounts belonging to women sit dormant.
- **Surveillance, not ignorance:** husbands routinely hold the PIN and receive the SMS alerts on accounts that legally belong to their wives.
- **Literacy isn't the gap that matters:** 21% of Indian women are financially literate vs 27% of men — a real gap, but not the one stopping ₹200 from being saved quietly.
- **Still on paper:** 10.05 crore women across 90.87 lakh SHGs are tracked on paper ledgers, invisible to any digital system.

## The Solution

Tijori turns a shared household phone into a private financial tool.

- **Voice-first interface:** she asks and is answered in Hindi — no reading required.
- **Hidden ledger:** invisible from the phone's main UI, no notification trail on transactions.
- **Duress PIN / decoy mode:** a second PIN opens a fake near-zero balance if someone demands the phone.
- **Real DPI rails:** Account Aggregator for consented account data, UPI Circle for a delegated, self-authorized savings limit.
- **AI-personalized savings:** a "safe to save this week" nudge computed from her real, irregular cashflow — not a generic tip.

## Capabilities

- **Onboarding:** guided setup, no seed phrases, no smartphone literacy assumed.
- **Voice balance check:** ask her hidden balance out loud, get a spoken answer.
- **Voice-directed saving:** speak an amount and a goal; the ledger updates live.
- **Goal tracking:** one dream goal, one pot, moving together — progress shown as a simple bar, not a spreadsheet.
- **Duress mode:** a rehearsed second PIN that swaps the entire visible state to a decoy.
- **Cashflow-aware nudges:** weekly "safe to save" amount personalized to irregular income patterns.
- **Document scanning:** budgeting support via receipt/document capture (backend document analysis).

## Technical Architecture

### Core Technologies

| Technology | Purpose |
|---|---|
| FastAPI (Python) | Backend API — document analysis, budgeting logic, voice request handling |
| React + Vite + Tailwind | Frontend — onboarding, dashboard, voice coach UI |
| Web Speech API | Browser-native Hindi speech-to-text and text-to-speech |
| Groq | LLM inference for ambiguous/compound voice requests |
| Account Aggregator (Finvu/Onemoney sandbox) | Consented, revocable account data |
| UPI Circle | Delegated savings limit (mocked against NPCI's published contract for this build) |

### System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      USER LAYER                          │
│                                                          │
│   Shared Phone ──► Browser (Chrome) ──► Web Speech API   │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite :5173)              │
│                                                         │
│   PIN / Dial ──► Dashboard ──► useVoice hook            │
└────────┬────────────────────────────┬───────────────────┘
         │                            │
         ▼                            ▼
┌──────────────────────┐    ┌──────────────────────────┐
│   voiceEngine.js     │    │   FASTAPI BACKEND        │
│                      │    │                          │
│   Local ledger tier  │    │   Document analysis      │
│   Groq tier          │◄──►│   Budgeting logic        │
│   Keyword fallback   │    │   Voice request handling │
└──────────────────────┘    └──────────────────────────┘
                                          │
                                          ▼
                              ┌────────────────────────────┐
                              │  Account Aggregator +      │
                              │  UPI Circle (sandbox/mock) │
                              └────────────────────────────┘
```

### Project Structure

```
tijori/
│
├── backend/                       # FastAPI backend
│   ├── routes/                    #   API endpoints
│   ├── services/                  #   Document analysis, budgeting logic
│   └── prompts/                   #   Prompt templates
│
├── frontend/                      # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── IntroStitch.jsx    #   scroll-driven intro animation
│   │   │   ├── LockDial.jsx       #   rotary PIN dial
│   │   │   ├── PinScreen.jsx      #   PIN entry (drag/scroll + dwell), keypad fallback
│   │   │   ├── DecoyDashboard.jsx #   duress view
│   │   │   └── Dashboard/         #   balance, goal, insight, transactions, mic, nav
│   │   ├── lib/
│   │   │   └── voiceEngine.js     #   STT → intent → ledger → TTS
│   │   ├── hooks/
│   │   │   └── useVoice.js        #   the voice layer as one hook
│   │   ├── services/
│   │   │   ├── goalService.js
│   │   │   ├── duressService.js
│   │   │   └── insightService.js
│   │   └── data/
│   │       └── initialData.js     #   real + decoy state
│   └── package.json
│
└── README.md
```

`hiddenSavings` is the tijori itself — saving makes it go up. One pot, one dream goal, moving together.

### Voice Layer

Three tiers, in order, in `src/lib/voiceEngine.js`:

| Tier | Handles | Cost |
|---|---|---|
| Local ledger | Unambiguous questions and digit amounts | ~0ms, no network |
| Groq | Greetings, fear, word-numbers, compound sentences | ~450ms |
| Keyword rules | Fallback when Groq is unreachable | ~1ms |

The local tier deliberately declines anything ambiguous rather than guessing, so compound requests fall through to Groq instead of silently dropping the transfer.

The model never states a number directly — it emits placeholders (`{{balance}}`, `{{goal_remaining}}`) filled in after the ledger mutates, so the spoken figure can never drift from the screen. `guardNumbers()` is the backstop, swapping in a deterministic template if a reply contains an unverified number.

Overdrawing is refused, not clamped — clamping would silently empty the tijori on a request that was meant to be declined.

### Voice Commands

| Command (Hindi) | Meaning | Description |
|---|---|---|
| मेरी बचत कितनी है | "How much are my savings?" | Speaks current hidden balance |
| दो सौ बचाओ | "Save two hundred" | Adds ₹200 to the goal, updates ledger |
| बकरी के लिए और कितना चाहिए | "How much more for the goal?" | Speaks remaining amount to target |
| अगर पति को पता चल गया तो | "What if my husband finds out?" | Routed to Groq — reassurance + duress-mode reminder |

## Getting Started

### Prerequisites

- Node.js v18+
- Python 3.10+ (for the FastAPI backend)
- A Groq API key
- Chrome (voice features require Web Speech API — not supported in Firefox)

### Installation

Clone the repository:

```bash
git clone <your-repo-url>
cd tijori
```

Install dependencies:

```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && pip install -r requirements.txt
```

### Configuration

Frontend — create `frontend/.env.local`:

```bash
VITE_GROQ_API_KEY=your_groq_key_here
```

### Usage

Start services:

```bash
# Terminal 1: Frontend
cd frontend
npm run dev
# Opens on http://localhost:5173

# Terminal 2: Backend
cd backend
uvicorn main:app --reload --port 8000
```

Serve over localhost — opening the file directly will not grant mic permission.

The demo, in order:

1. **Scroll** — the intro stitches the tijori into existence, ring by ring. Skip (top right) jumps past it during rehearsal.
2. **Turn the dial** — drag or scroll to the nearest digit; rest half a second to lock it in. Four digits opens it.
   - `1234` → the real tijori
   - `9999` → the decoy
3. **Tap the mic and speak Hindi**, or type into the box below it.

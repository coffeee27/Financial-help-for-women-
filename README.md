# GirlsHack Project — Tijori — "the safe she controls"

A voice-first financial coach that gives a woman a private view of her own
money, savings her household can't see or drain, and a coach that speaks Hindi.

## Structure

- `frontend/` — React + Vite + Tailwind + Framer Motion. This is the demo.
- `backend/` — FastAPI scaffolding for document analysis, budgeting and voice.
  Currently stubs; the frontend runs standalone on in-memory state and does not
  call it.

## Run it

```bash
cd frontend
npm install
cp .env.example .env.local     # paste your Groq keys into it
npm run dev
```

Opens on <http://localhost:5173>. Best in **Chrome** — the mic uses the Web
Speech API, which Firefox doesn't support. Serve over `localhost` rather than
opening the file directly, or the browser won't grant mic permission.

### Keys

Two, in `.env.local` (gitignored — never commit it):

| Variable | Used by | Why separate |
| --- | --- | --- |
| `VITE_GROQ_KEY` | the voice coach | conversation and intent |
| `VITE_GROQ_ESTIMATE_KEY` | `priceEstimator.js` | goal pricing only, so estimation traffic can be rotated or rate-limited without touching the voice loop |

Without them the app still runs — it silently drops to the keyword tier and
only answers the fixed commands. **Vite reads `.env.local` at startup only**, so
restart the dev server after editing it.

Groq's daily token allowance is per **model** and per **organisation**, not per
key — two keys on the same account share one pot. On a 429 the voice loop
switches to `llama-3.1-8b-instant` for the rest of the session, and price
estimation runs on the small model permanently.

## The demo, in order

1. **Scroll** — a needle stitches the tijori into existence, ring by ring, then
   the enamel fills in and the numerals engrave on. `Skip` (top right) jumps
   straight past it during rehearsal.
2. **Turn the dial** — drag it or scroll it. It snaps to the nearest of 0–9;
   rest on a number for half a second and that digit locks in. Four digits opens
   it. `Use keypad` is there if the dial misbehaves in front of judges.
   - `1234` → the real tijori
   - `9999` → the decoy (rest on 9; repeats commit on a slower beat)
3. **Tap the mic** and speak Hindi, or type into the box below it.

On a desktop browser the app sits inside a phone frame. Below 1024px wide the
frame disappears and the app fills the screen, so a real phone shows the real
thing.

### Lines worth demoing

| Say | What happens |
| --- | --- |
| `मेरी बचत कितनी है` | answered locally, ~0ms, no network |
| `दो सौ बचाओ` | ledger goes up, row in Recent |
| `मुझे अब बकरी खरीदनी है` | goal changes, **price estimated live** |
| `अगर पति को पता चल गया तो` | the reassurance answer |
| `पाँच सौ निकालो` → `देवर मांग रहे हैं` | the Support flow — see below |

## Tabs

**Home** · **Goals** · **Voice** · **Support** · **Settings**. All five work on
both dashboards. The decoy gets plausible versions of every one, because a nav
where a button does nothing is itself a tell.

## Goals

Naming a new goal prices it through `priceEstimator.js` and repoints the tijori
at it; the pot carries over, so switching goals is never punished. Reaching the
target **completes the goal on the spot** — the price leaves the tijori, the
goal clears, and she's asked for the next one. Doing it at the moment of
crossing means the ledger can never sit at 130% funded.

Naming a goal she can already afford does **not** buy it. It says she has
enough and waits for her to decide.

## Support — the withdrawal pause

**Withdrawals are requested, not executed.** Asking for money out opens the
Support tab with a pending request; the ledger only moves when she confirms
there. The coach asks what the money is for and advises on the answer:

- **Medicine, illness, a child's fees, rent** — says plainly it's worth taking
  out. A savings app that guards the goal ahead of her wellbeing is worse than
  no app.
- **Something that can wait** — one sentence on what it costs the goal, and an
  offer to take out less.
- **Someone else is demanding it** — does *not* tell her to refuse and does
  *not* tell her to hand it over. Her money, her decision, partial is allowed.

Three rules the screen is built around, in order:

1. It never reads as an accusation. Whoever is pressuring her can see this
   screen, so "is someone forcing you?" would put her in more danger than no app
   at all. It looks like an ordinary withdrawal review; the nav icon is a heart
   labelled *Support*, not a siren.
2. It never traps her money. Confirm is one tap, the same weight as cancel,
   never behind a lecture.
3. Nothing moves until she says so.

## How the voice layer works

Three tiers, in order, in `src/lib/voiceEngine.js`:

| Tier | Handles | Cost |
| --- | --- | --- |
| **Local ledger** | unambiguous questions and digit amounts | ~0ms, no network |
| **Groq** | everything else — greetings, fear, word-numbers, compound sentences | ~450ms |
| **Keyword rules** | Groq unreachable | ~1ms |

The local tier deliberately **declines** anything ambiguous rather than
guessing, so compound requests ("save 100 and tell me how far the goal is")
fall through to Groq instead of silently dropping the transfer.

**The model never states a number.** It emits placeholders — `{{balance}}`,
`{{goal_remaining}}` — filled in *after* the ledger mutates, so the spoken
figure can't drift from the screen. `guardNumbers()` is the backstop: any
ledger-scale number in a reply that isn't a real value swaps the whole sentence
for a deterministic template.

Overdrawing is **refused, not clamped** — clamping would silently empty the
tijori on a request that was meant to be declined.

Other intents worth knowing: `spend_mention` (she mentions a purchase — the
tijori holds savings, so household spending is never deducted) and `reconcile`
(she states her true total when the app has drifted from the cash in her hand;
the difference is logged as `मिलान`, not silently rewritten).

## Layout

```
frontend/src/
  components/
    PhoneFrame.jsx         desktop device shell; publishes --app-h
    IntroStitch.jsx        scroll-driven needle + thread
    LockDial.jsx           the dial — stitched in the intro, turned on the PIN
    PinScreen.jsx          rotary PIN (drag/scroll + dwell), keypad fallback
    VoicePanel.jsx         transcript, reply, text fallback, mic errors
    DecoyDashboard.jsx     duress view
    Dashboard/             balance, goal, insight, transactions, mic, nav
      GoalsView.jsx  VoiceView.jsx  EmergencyView.jsx  SettingsView.jsx
  lib/voiceEngine.js       STT → intent → ledger → TTS
  lib/priceEstimator.js    goal pricing, separate key + small model
  hooks/useVoice.js        the whole voice layer as one hook
  services/                goalService, duressService, insightService
  data/initialData.js      real + decoy state
```

### Two contracts not to break

**`hiddenSavings` is the tijori itself** — saving makes it go **up**, and
`goal.saved` mirrors it. One pot, moving together, so the two numbers on screen
can never disagree.

**Transaction labels are load-bearing.** `TransactionList` styles rows by
matching them, so renaming one in `goalService.js` silently changes the UI:

| Label | Row |
| --- | --- |
| `नया लक्ष्य: X` | 🎯 amber, amount hidden |
| `सपना पूरा: X` | 🎉 amber |
| `ज़रूरी निकासी` | 🆘 clay |
| `मिलान` | 🔄 muted |

Weeks-remaining is derived by `weeksAtPace()`, never hardcoded — a stored
"4 weeks" once contradicted the Goals tab's computed 44.

`--app-h` is the height of one screen: `100svh` normally, the frame's pixel
height inside `PhoneFrame`. Screens use `h-[var(--app-h)]`, not `100svh`.

## Not done

- **No persistence.** Everything is in-memory React state — reload and it's back
  to ₹18,540 with the sewing machine. Good for rehearsals, but say so honestly
  if a judge asks whether it's saved.
- **No backend.** The frontend does not call `backend/`.
- **Groq is a cloud call**, which contradicts the on-device, no-log threat model
  in the pitch. Say it first, framed as the scoped WebLLM port, rather than
  letting a judge find it.
- **UPI Circle** is mocked against NPCI's published contract.
- The mic and the dial *drag* need testing on the actual demo device — both are
  hardware paths that can't be verified from a script.

## Before presenting

Delete the crib line at the bottom of `PinScreen.jsx`
(`demo · 1234 real · 9999 decoy`).

# Tijori — "the safe she controls"

A voice-first financial coach that gives a woman a private view of her own
money, savings her household can't see or drain, and a coach that speaks Hindi.

## Run it

```bash
cd frontend
npm install
cp .env.example .env.local     # paste a Groq key into it
npm run dev
```

Opens on <http://localhost:5173>. Best in **Chrome** — the mic uses the Web
Speech API, which Firefox doesn't support. Serve over `localhost` rather than
opening the file directly, or the browser won't grant mic permission.

## The demo, in order

1. **Scroll** — a needle stitches the tijori into existence, ring by ring, then
   the enamel fills in and the numerals engrave on. `Skip` (top right) jumps
   straight past it during rehearsal.
2. **Turn the dial** — drag it or scroll it. It snaps to the nearest of 0–9;
   rest on a number for half a second and that digit locks in. Four digits opens
   it. `Use keypad` is there if the dial misbehaves in front of judges.
   - `1234` → the real tijori
   - `9999` → the decoy (rest on 9; it repeats on a slower beat)
3. **Tap the mic** and speak Hindi, or type into the box below it.

Try: `मेरी बचत कितनी है` · `दो सौ बचाओ` · `बकरी के लिए और कितना चाहिए` ·
`अगर पति को पता चल गया तो`

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
`{{goal_remaining}}` — which are filled in *after* the ledger mutates, so the
spoken figure can't drift from the screen. `guardNumbers()` is the backstop: any
ledger-scale number in a reply that isn't a real value swaps the whole sentence
for a deterministic template.

Overdrawing is **refused, not clamped** — clamping would silently empty the
tijori on a request that was meant to be declined.

## Layout

```
frontend/src/
  components/
    IntroStitch.jsx        scroll-driven needle + thread
    LockDial.jsx           the dial — stitched in the intro, turned on the PIN
    PinScreen.jsx          rotary PIN (drag/scroll + dwell), keypad fallback
    DecoyDashboard.jsx     duress view
    Dashboard/             balance, goal, insight, transactions, mic, nav
  lib/voiceEngine.js       STT → intent → ledger → TTS
  hooks/useVoice.js        the whole voice layer as one hook
  services/                goalService, duressService, insightService
  data/initialData.js      real + decoy state
```

`hiddenSavings` is the tijori itself — saving makes it go **up**. One pot, one
dream goal, moving together.

## Not done

- **Backend** — none. The frontend runs standalone on mock state.
- **Bottom nav** — Home/Goals/Voice/Settings animate but don't change the view.
- **On-device inference** — Groq is a cloud call, which contradicts the no-log
  threat model in the pitch. The port to WebLLM is scoped, not built. Say so
  rather than letting a judge find it.
- **UPI Circle** — mocked against NPCI's published contract.

## Before presenting

Delete the crib line at the bottom of `PinScreen.jsx`
(`demo · 1234 real · 9999 decoy`).

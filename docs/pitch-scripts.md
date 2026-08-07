# Tijori — Pitch Scripts

Two scripts: the 4-minute judge round (prototype-led) and the 7-minute mentor
pitch (problem + solution). Demo numbers below match the seeded state exactly —
check them against the app before you present, and re-check after any rehearsal
that leaves the ledger changed.

**Seeded state:** balance **₹18,540** · goal **अपनी सिलाई मशीन ₹25,000 (74%)**
· safe-to-save **₹150/week** · real PIN **1234** · decoy PIN **9999** · decoy
balance **₹240**

---

# 4-Minute Judge Round

*Prototype only. No problem recap — they've heard it. Get to the app fast.*

**A** drives the device and narrates. **B** plays the person who walks in, for
the decoy beat. **C** closes and covers any beat that overruns.

---

### Opening (0:05) — A

> "This is Tijori. Easier to show you than explain."

---

### Beat 1 — Unlock (0:20) — A

*Turn the dial to 1‑2‑3‑4.*

> "She turns a dial, not a keypad. It looks like nothing — that's deliberate.
> Right PIN, and this is hers: ₹18,540 that nobody else in the house can see."

---

### Beat 2 — Saving by voice (0:25) — A

*Tap mic:* **"मैंने आज दो सौ रुपये बचाए"**

> "She just says it. Not a command — she's telling it what she did. Watch the
> number move."

*(₹18,540 → ₹18,740, and a row appears in Recent.)*

---

### Beat 3 — Goal, budget, growth: one scroll (0:35) — A

*Scroll the home screen slowly. Everything below is already on it.*

> "Her goal is a sewing machine — ₹25,000, she's 74% there.
>
> This week she can safely put aside ₹150. She never does that maths.
>
> And this" — *(the बढ़ता पैसा card)* — "is the part we're most pleased with.
> Same ₹18,540: at home in a year it's still ₹18,540. In a savings account,
> ₹19,004. In a recurring deposit, ₹19,838. Keep adding ₹150 a week and it's
> ₹27,912 — she'd pass her goal a year early.
>
> That's compound interest explained to someone who can't read a chart. It says
> plainly it's information, not advice. We don't name a bank and we don't
> promise a return."

---

### Beat 4 — Withdrawal (0:30) — A

*Tap mic:* **"पाँच सौ निकालो"**

> "Now she needs money out. It doesn't take it."

*(Support tab opens. ₹500 · अभी ₹18,540 → बाद में ₹18,040 · "सिलाई मशीन लगभग
3 हफ्ते और दूर हो जाएगी".)*

> "It asks what it's for and says what it thinks. If it's medicine, it tells her
> to take the money. If someone's demanding it, it says the money is hers and
> she can give part instead of all — it won't tell her to refuse, and it won't
> tell her to hand it over.
>
> Both buttons stay on screen the whole time. Nothing moves until she taps."

---

### Beat 5 — The decoy (0:45) — A + B

*Slow down. This is the beat that lands.*

**B** *(steps in close, casual):* "क्या कर रही हो?"

**A** *(calm, no announcement, turns the dial to 9‑9‑9‑9 — rest on 9, it takes a
few seconds, let the pause be tense)*

*(Screen becomes the decoy: ₹240, no goal, household spends, no mic.)*

> "Same app. Same dial. ₹240 and a shopping list.
>
> Every tab still works, because a dead button is a giveaway. There's no mic,
> because a voice coach is a giveaway. Settings never mentions a second PIN. And
> a wrong PIN takes exactly as long as this one, so the timing can't tell him
> anything.
>
> Without this she has two options when someone demands the phone: show
> everything, or refuse. This is the third one."

*(Pause. Let it sit.)*

---

### Close (0:25) — C

> "To be straight with you about what you just saw: the ledger, the voice, the
> decoy, the withdrawal pause — all real, all working. The rails are scoped.
> Account Aggregator and UPI Circle are the integration path, mocked against
> NPCI's published contract, and the state is in-memory for this build.
>
> We'd rather tell you that than have you find it.
>
> Tijori doesn't ask her to change her household. It gives her one thing back —
> a place only she can see."

---

### Timing

| Beat | Time | Cumulative |
|---|---|---|
| Opening | 0:05 | 0:05 |
| Unlock | 0:20 | 0:25 |
| Voice saving | 0:25 | 0:50 |
| Goal + budget + growth | 0:35 | 1:25 |
| Withdrawal | 0:30 | 1:55 |
| Decoy | 0:45 | 2:40 |
| Close | 0:25 | 3:05 |
| Buffer | 0:55 | 4:00 |

### If it breaks

- **Mic misses:** retry once, then *"voice gets shy on conference wifi"* and type
  into the box below it. Same pipeline, same result — don't apologise twice.
- **Dial fights you:** there's a **Use keypad** link right under it. Use it and
  move on; nobody remembers how the PIN went in.
- **Running long:** shorten Beat 4 to one sentence. Never shorten Beat 5.
- **Running short:** hold the pause after the decoy, then add: *"the coach never
  says a number the ledger hasn't already recorded — every figure is filled in
  after the transaction, so what she hears can't drift from what's true."*

### Reset between rounds

Reload the page. State is in-memory, so it returns to ₹18,540 and the sewing
machine. Do this before every run so your numbers match this script.

---

# 7-Minute Mentor Pitch

*Problem + solution. Keep the app open in case they ask.*

---

## A — The Problem (1:40)

> "Think about the last time you shared a phone with someone. Now imagine it's
> the only phone in the house, and every rupee you save on it, someone else can
> see. Every notification. Every SMS.
>
> **4.93 crore** Jan Dhan accounts belonging to women sit dormant. Not because
> they don't want them — because they can't use them privately. Husbands hold
> the PIN and receive the alerts on accounts that legally belong to their wives.
>
> There is a literacy gap — 21% of women against 27% of men. But that gap is not
> what stops someone saving ₹200 a week. She can understand compound interest
> perfectly and still not move ₹200 without the SMS reaching his phone.
>
> So literacy isn't the blocker. It's still a gap — we'll come back to how we
> close it — but the blocker is control.
>
> The real barrier isn't a bank account. It's a private one."

---

## B — The Solution & How It's Built (2:20)

> "Tijori — Hindi for safe. A voice-first coach that turns a shared household
> phone into something private.
>
> **Voice-first.** She doesn't read menus or fill forms. She talks, in Hindi,
> and it talks back. That matters for someone doing 289 minutes a day of unpaid
> care work who may not read well.
>
> **Duress mode.** A second PIN opens a near-zero dashboard that is structurally
> identical to the real one. If someone demands the phone, there's nothing to
> find. It's the feature we're proudest of and the one we thought hardest about.
>
> **Literacy where it lands.** We don't test her and we don't run a course. When
> she asks how her money grows, it tells her — in her language, with her own
> numbers: ₹18,540 at home stays ₹18,540; in a deposit it's ₹19,838. Information,
> not advice. No bank named, no return promised.
>
> **How it's built.** React and Vite on the front. Web Speech for Hindi in and
> out. A three-tier voice layer: unambiguous questions are answered locally in
> about a millisecond with no network at all, Groq handles everything else —
> compound sentences, reassurance, word-numbers — and a keyword tier catches it
> if Groq is unreachable, so the app degrades instead of dying.
>
> Two design rules we'd defend anywhere. **The model never states a number** — it
> emits placeholders that are filled in only after the ledger has updated, so
> what she hears can't drift from what's on screen. And **an overdraw is refused,
> not clamped** — quietly draining someone's safe is the one failure this app
> cannot have.
>
> A FastAPI service is scaffolded for the backend. Today the demo runs standalone
> on in-memory state, and Account Aggregator and UPI Circle are mocked against
> NPCI's published contract. That's a hackathon-scoped build and we'd rather say
> so."

---

## C — What Using It Feels Like (2:10)

> "End to end.
>
> She opens it and turns a dial. It doesn't look like a banking app if someone
> glances over. The right PIN opens her savings; a different PIN opens the decoy.
>
> Inside, she talks. She says she saved ₹200 and it's on her goal — no form, no
> menu. She says she wants a goat instead of a sewing machine, and it prices the
> goat and repoints her savings, keeping everything she's already put away. When
> she reaches a target, it doesn't just stop — it takes the price out, clears the
> goal, and asks what's next.
>
> If the app's number ever drifts from the cash in her hand, she says what she
> actually has and it corrects itself — and logs the correction rather than
> quietly rewriting history.
>
> And when she wants money out, it doesn't obey and it doesn't block. It asks
> what it's for. Medicine, a child's fees — it tells her to take it; her
> wellbeing comes before the goal. Something that can wait — it says what it
> costs her and offers a smaller amount. Someone else demanding it — it says the
> money is hers, she can give part instead of all, and stops there.
>
> That last one is deliberate. It never asks 'is someone forcing you' — because
> whoever is forcing her can read that screen."

---

## Close (0:30)

> "Tijori doesn't ask anyone to change their household. No second phone, no
> literacy course, no one's permission.
>
> It gives her one thing back: a place only she can see. Happy to take questions
> — and we can show you the prototype now if you'd like."

---

### Timing

| Section | Time | Cumulative |
|---|---|---|
| A — Problem | 1:40 | 1:40 |
| B — Solution & build | 2:20 | 4:00 |
| C — Walkthrough | 2:10 | 6:10 |
| Close | 0:30 | 6:40 |
| Buffer | 0:20 | 7:00 |

**If you're running long,** cut B's stack paragraph to: *"standard modern web
stack, with a three-tier voice layer that keeps working when the network
doesn't."* Keep the two design rules — they're what make you sound like
engineers.

---

# Questions you will get

**"Why not just a budgeting app?"**
> "A budgeting app assumes she already has privacy. We built the layer
> underneath — the privacy itself."

**"Why a decoy? Isn't that enabling deception?"**
> "It's for one moment: when someone demands she open the app. Without it she
> has two options — show everything, or refuse. The decoy is a third. Duress
> modes are standard in domestic-violence safety apps; we imported a known
> pattern into finance. And the money is already legally hers."
>
> If pushed, name the design details: ₹240 not ₹0, because an empty account
> invites *where did it go*. No mic on the decoy. Identical timing on a wrong
> PIN. Those show you took it seriously.

**"What stops the AI adding money she didn't ask for?"**
> "It can't state a number at all — numbers are substituted after the ledger
> updates. And withdrawals are requested, not executed; nothing moves until she
> confirms."

**"Is UPI Circle live?"**
> "No. Mocked against NPCI's published contract. Production access needs a PSP
> partnership and NPCI approval — that's a 6–12 month BD problem, not an
> engineering one."

**"Groq is a cloud call — doesn't that break your privacy claim?"**
> Say this before they do. "Today it runs on Groq for speed. The architecture
> needs it on-device — that's the WebLLM port, and it's the difference between a
> demo and a product."

**"Where does ₹150 come from?"**
> "A placeholder for a cashflow forecast on Account Aggregator data. The
> interface is built for it; the model is roadmap."

**"What about the 10 crore women on paper ledgers?"**
> That's distribution, not a feature. SHG federations are the channel and the
> first revenue line — don't claim the app digitises SHG ledgers today.

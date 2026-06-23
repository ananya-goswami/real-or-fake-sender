# Activity 2 — "Real or Fake Sender?" — Voiceover Script

## Voice direction
- **Character:** Tej — a friendly kid detective guide.
- **Accent / tone:** Indian English, **warm, soft, cheerful and encouraging** — like a kind older sibling or favourite teacher talking to a 10–13 year old (Class 6–8).
- **Pace:** unhurried and clear. Smile while reading. Light energy on the questions, reassuring on the clues, celebratory on the ending.
- **Audience:** children, so keep it lively but gentle — never harsh, even on wrong answers.

## How to use these files
The game already plays voiceover automatically. Just generate each line below and save it with the **exact file name** into:

```
Activity_2/audio/voiceover/en/<name>.ogg
```

- Preferred format: **.ogg** (Vorbis). If you can only export **.mp3 / .wav**, send them to me (or drop them in `audio/voiceover/en/`) and I'll convert to `.ogg` with the same names — no code changes needed.
- Keep the same file names and the game will pick them up instantly.
- (Later, for Hindi etc., we can add `audio/voiceover/hi/` and switch by language.)

---

## 1. Intro  →  `intro.ogg`
> Hi there, detective! Some messages are real, and some are fake. Read each message, look for the clues, then tap Fake or Real. Are you ready? Let's begin!

---

## 2. The five messages (read aloud, then ask)

### `q_sbi.ogg`
> Read this message. "Your bank account needs checking today. Please verify your details now at sbi-secure-dot-xyz to keep using your account." Is this sender real, or fake?
> *(Pronounce the link as: "S-B-I dash secure dot X-Y-Z")*

### `q_hdfc.ogg`
> Read this message. "A payment of five hundred rupees was made from your account today. If this was not you, call the bank help number printed on your card." Is this sender real, or fake?

### `q_jio.ogg`
> Read this message. "You have won free mobile data for many days! Click now and fill in your details before this special offer ends." Is this sender real, or fake?

### `q_amazon.ogg`
> Read this message. "Your order number X-D-8-8-2-1 has shipped and is on the way. You can check delivery updates in your shopping app." Is this sender real, or fake?

### `q_upi.ogg`
> Read this message. "Your payment app is in danger and may stop working soon. Reset it right now using this link, upipay-dot-net." Is this sender real, or fake?
> *(Pronounce the link as: "U-P-I-pay dot net")*

---

## 3. The clue / feedback for each message

### `f_sbi.ogg`
> Fake bank link! The link is not from the real bank website. Fake links copy trusted names to trick people.

### `f_hdfc.ogg`
> Transaction alert. This message only tells you about a payment. It does not ask for a password or a strange link. This one is real.

### `f_jio.ogg`
> Too good, and too rushed! "Free data" plus "click now" is a pressure trick. Real offers should be checked in the official company app.

### `f_amazon.ogg`
> Order update. This is a simple shipping message. It does not ask you to click a strange link, pay money, or share private details. This one is real.

### `f_upi.ogg`
> Fear, and a fake link! Scammers use scary words to make you hurry. The reset link is not from a real bank or payment app.

---

## 4. Finish  →  `complete.ogg`
> Great job, detective! You judged all the messages. Remember — watch out for strange links, scary words, and offers that seem too good. Stay smart, and stay safe!

---

## Recommended tools for a warm Indian voice
- **ElevenLabs** (multilingual; has Indian-English voices, very natural) — pick a young, warm voice and set stability a bit lower for cheerfulness.
- **Google Cloud TTS** — `en-IN` Neural/WaveNet voices (e.g. `en-IN-Wavenet-D`).
- **Murf.ai / Play.ht** — both offer Indian-English voices with tone control.
- Or record a real person — a friendly Indian-English speaker reading the lines above.

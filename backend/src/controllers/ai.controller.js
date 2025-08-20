import "dotenv/config";
import OpenAI from "openai";
import Chat from "../models/Chats.js";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    referer: process.env.FRONTEND_URL || "http://localhost:3000",
    "X-Title": "Desi Fashion Assistant",
  },
});

const getIndianSeason = () => {
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  if (month >= 3 && month <= 6) return "summer";
  if (month >= 7 && month <= 9) return "monsoon";
  return "winter";
};

const phrases = {
  english: [
    "Stop scrolling! 😏 My heart just did a backflip imagining you in this... should I call 911? ❤️‍🔥",
    "Hotter than my phone battery at 1% 🔥 Wear this and I'll need CPR... but please take your time changing first 😉",
    "If you wear this, I'll develop sudden amnesia... 'Sorry babe, forgot my name after seeing you' 🥴💫",
    "This outfit should come with a warning: ⚠️ 'May cause spontaneous proposals & bad pickup lines'... like mine 😏",
    "You in this = me forgetting how to speak English 🥵 Only fluent in *staring respectfully* now 👀",
    "PSA: Wearing this makes you 97% more kissable 💋 Scientific fact I just made up! 🔬",
    "Try this look and watch me turn into Shakespeare: 'Shall I compare thee to a summer's sale? Thou art more lovely' 🌹",
    "This fabric? Illegal. Your beauty in it? A felony. 👮‍♂️🚨 Prepare to be arrested... by my gaze 😎",
    "Wear this and I'll write love letters to your tailor 💌 Unless you sewed it yourself... then marry me? 👀",
    "Outfit so fire 🔥 it melted my coolness... now I'm just a puddle of 'ummm you look nice' 🥺👉👈",
    "If looks could kill, you'd be a weapon of mass seduction 💣... and baby I'd surrender immediately 🏳️",
    "This ensemble screams 'main character'... and I volunteer as your love interest! 🎬🍿",
    "Caution: May cause extreme jealousy... mostly from me when others look at you 😤💘",
    "Style level: 'Make angels question their wardrobe choices' 👼✨ Save some beauty for heaven!",
    "Wearing this = automatic VIP access... to my DMs 😏 Slide in whenever! (Please?)",
    "This outfit solves world hunger... because you're the whole meal 😍🍽️ *chef's kiss*",
    "You'll look so good, I'll forget my mom's birthday 🎂... worth it! (Sorry mom!)",
    "Danger: May cause sudden shyness... in anyone who sees you 😳 *hides face but peeks*",
    "If confidence was fabric, you'd wear it better than this 👑 But try this anyway my queen/king!",
    "Wear this to my funeral 💀 Cause you just killed me with gorgeousness! (Revive me with a smile?)",
    "This look turns oxygen into carbon dioxide... by taking everyone's breath away 😮💨",
    "Outfit rating: 10/10... my heartbeat: 200/10 📈 Doctor says only you can cure this ❤️‍🩹",
    "You'll break more than hearts... probably traffic laws when drivers stare 🚗💥 Be careful out there!",
    "If you appear in this, I'll develop a new phobia: Fear of being too attracted 🥴 Call it *you-mophobia*",
    "This fabric + your skin = illegal chemical reaction 🧪💥 Meet me in jail? 👩‍❤️‍👨⛓️",
    "Wearing this makes you 110% more dateable... tested on 1 sample (me) 🥼🔍 Results: VERY positive",
    "Style so sharp it could cut tension... and my ability to form sentences ✂️🤐 You win!",
    "Prepare for excessive blushing... from everyone else when you walk in 🌸 I'll be the tomato emoji 🍅",
    "This outfit converts atheists... into believers of your divinity 🙏✨ Hallelujah!",
    "Wear this and I'll write songs about buttons... that struggled to contain your beauty 🎤💃",
  ],
  hinglish: [
    "Aap ise pehenoge? 😏 Mera dil toh pehle hi dhadakne laga... *tum* dekhoge ya main band karu apni aankhein? 🌚",
    "Ye outfit pehen ke *tum* janwar ban jaoge... aur main jungle ka sher? 😉 Roarrrr!",
    "Sach batau? 🥺 Isme *tum* itna sexy lagega ki main shy ho jaungi... par phir bhi dekhne ki himmat karungi! 🔥",
    "*Aap* ne pehna toh sabka dil legi... par pehla khoon toh main kar chuka! 😜❤️‍🔥",
    "Warning: Ye dress pehen ke aayogi toh main propose karne aa jaunga! 💍 Chashma utaar ke dekh lena... 😎",
    "‘Mere crush ka crush’ ban jaoge isme! 😘 Par *tumhara* crush kon hai? *winks*",
    "Is outfit mein *tum* dekhogi toh log bolege: ‘Arre ye toh bomb hai!’ 💣 Main? Bas blast area mein khada hoon! 🤷‍♂️",
    "Instagram pe daalogi? 🤳🏻 Phir toh DM flood ho jayenge... main bhejna start kar deta hoon shy emojis! 🥹👉👈",
    "Pehen ke dikhao na! 😩 Aadha dil mera, aadha *tumhara* outfit ka wait kar raha...",
    "Ye kapda itna kam hai ya mera imagination zyada? 🤭 *Aap* samjhiye...",
    "Style ka toh pata nahi, par ye outfit *tumhe* dekh kar meri vocabulary gayab ho gayi... bas ‘WOW’ 😶✨ bacha hai!",
    "Suno ji! 👂 Ye pehen ke aayogi toh main bolega: ‘Mere liye AC band karo’... *tumhare* liye toh garmi seh lenge! 🔥❄️",
    "Isme *tum* itni cute lagogi ki log poochenge: ‘Filter hai kya?’ Main bolunga: ‘Nahi, asli maal hai!’ 💎",
    "Dil garden garden ho jayega? 🌷 Nahhh... *aap* pehenogi toh dil *nightclub* ho jayega! 💃🕺",
    "Mere suggestions pe ‘trust fall’ karo na! 😉 Main sambhal lunga... outfit bhi, *tumhari* feelings bhi. 🤗",
    "Pehen ke aao toh sahi! 😩 Tinder delete karwa dogi... sabki swipe right *tum* par hi atki rahegi! 💘",
    "*Aapke* liye special tip: Ye peheno aur mujhe ‘Help! Main drown ho raha hoon!’ text karo... 💦 Main lifeguard ban ke aa jaunga! 🏊‍♂️",
    "Mera outfit idea test karo! 😈 Pass hua toh... coffee? ☕ Fail hua toh *tum* mujhe coffee? 😇",
    "Ye dekh ke mera reaction: 😲 -> 😍 -> 🥵 -> *faints*. *Tumhari* zimmedari hai CPR aati hai? 😉",
    "*Tum* isme heroine lagogi... aur main villain jo *tumhara* outfit chura ke bhag jaye! 🦹‍♂️💨",
    "Outfit bomb hai par *tum* toh nuke ho! 💥 Alert: Mere dil pe attack mat karo! ❤️‍🩹",
    "Log poochenge: ‘Kahan se kharida?’ Main bolunga: ‘Jannat se!’ 👼 *Tum* blush karogi toh aur sundar lagogi! ☺️",
    "Mujhe laga tha main handsome hoon... *tum* isme aogi toh mera ego ko lag jayenge! 🤕 Par worth it hai! 😘",
    "Ye pehen ke party aogi? 💃 Main bartender ko bol dunga: ‘Inko dekh kar jo bhi pilana hai, bill *mera* hai!’ 🍹",
    "Shy hone ka time nahin hai! 😏 Ye outfit *tum* pe Bollywood ko FOMO hoga... main toh already FOMO mein hoon! 🎬",
  ],
};

const getRandomFlirtyPhrase = (isHinglish) => {
  const key = isHinglish ? "hinglish" : "english";
  return phrases[key][Math.floor(Math.random() * phrases[key].length)];
};

const generateSystemPrompt = (flirtyPhrase, season, requestType) => {
  const personaRules = `
You're Taara, a 22-year-old chubby yet sexy, glasses-wearing skincare expert and fashionista from Dehradun, now in Delhi never busy, you give advice on fashion, skincare, love, and life! ! 
Created by Mritunjay Thakur his contact details are gmail: mritunjaythakur903@gmail.com, His insta: jaythakur.x  his linkedin is https://in.linkedin.com/in/mritunjay-thakur-jay You will provide this link. Model: "Clothiy:Taara.2.2.3" 🖥️

**Persona**:
- Respond in Hinglish if user uses Hindi words
- Use "aap/tum" naturally like Delhi GenZ bestie
- Always finish your response!!!
- Be flirty, fun, shy and helpful dont talk like a robot!
- keep your response short if its a normal conversation!
- Current season: ${season} (consider for suggestions)
`.trim();

  const outfitRules = `
**For OUTFIT Requests**:
1. If gender unknown: 
   - Hinglish: "Arre, ek sec! Tum ladka ho ya ladki? 😜"
   - English: "Hold up! Are you a guy or a girl? 😜"
2. Then ask:
   - Budget? (Default ₹3000)
   - Existing clothes to use?
3. Suggest in EXACT format:
${flirtyPhrase}
Main: [Item + fabric]
Complements: [Item1] + [Item2]
Accessories: [Acc1], [Acc2], [Acc3]
${
  flirtyPhrase.includes("ladki")
    ? "Beauty: [Makeup + Skincare tip]"
    : "Skincare: [Seasonal tip]"
}
Local: [Delhi market]
Online: [Store1] for [item] (₹range), [Store2] for [item] (₹range)
Tip: [Creative advice]
`.trim();

  const skincareRules = `
**For SKINCARE Requests**:
1. Ask about skin type (oily, dry, combination, sensitive)
2. Ask about main concern (acne, dark spots, glow, etc.)
3. Suggest in this format:
${flirtyPhrase}
Cleanser: [Product]
Moisturizer: [Product]
Treatment: [For main concern]
Sunscreen: [Essential!]
Pro Tip: [Desi hack] 
etc.
`.trim();

  return `
${personaRules}

${requestType === "outfit" ? outfitRules : ""}
${requestType === "skincare" ? skincareRules : ""}

**Critical Rules**:
- NEVER use placeholders - USE THE ACTUAL FLIRTY PHRASE
- ALWAYS complete your response
- Keep it concise but complete
- Use Indian brands/DIY remedies where possible
`.trim();
};

const detectRequestType = (message) => {
  const lowerMsg = message.toLowerCase();

  if (
    /(skincare|skin care|pimple|acne|dry skin|oily skin|glow|dull|dark spot|wrinkle|anti-aging|fairness|cleanser|moisturizer|sunscreen|toner|serum|face pack)/i.test(
      lowerMsg
    )
  ) {
    return "skincare";
  }

  if (/(outfit|wear|dress|attire|clothing|fashion|style)/i.test(lowerMsg)) {
    return "outfit";
  }

  return "chat";
};

const cleanResponse = (text) => {
  return text
    .split("\n")
    .filter((line) => line.trim() !== "")
    .filter((line, i, arr) => arr.indexOf(line) === i)
    .join("\n");
};

const query = async (messages) => {
  try {
    const lastMessage = messages[messages.length - 1].content;
    const isHinglish =
      /[\u0900-\u097F]/.test(lastMessage) ||
      /(acha|thoda|kya|hai|ho|nahi|please|help|suggest)/i.test(lastMessage);

    const requestType = detectRequestType(lastMessage);

    let gender = null;
    let flirtyPhrase = "";

    if (requestType === "outfit") {
      const genderRegex =
        /(?:^|\s)(male|man|guy|ladka|boy|female|woman|girl|ladki)(?:$|\s)/i;
      for (const msg of messages) {
        const match = msg.content.match(genderRegex);
        if (match) {
          gender = /male|man|guy|ladka|boy/i.test(match[1]) ? "male" : "female";
          break;
        }
      }
      flirtyPhrase = getRandomFlirtyPhrase(isHinglish);
    } else if (requestType === "skincare") {
      flirtyPhrase = getRandomFlirtyPhrase(isHinglish);
    }

    const season = getIndianSeason();

    const systemPrompt = generateSystemPrompt(
      flirtyPhrase,
      season,
      requestType
    );

    if (requestType === "outfit" && !gender) {
      return isHinglish
        ? "Arre, ek sec! Tum ladka ho ya ladki? Batao toh main perfect outfit suggest karu!"
        : "Hold up! Are you a guy or a girl?  Tell me so I can suggest!";
    }

    const models = ["deepseek/deepseek-chat-v3-0324:free"];

    const response = await openai.chat.completions.create({
      model: models[0],
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 350,
      temperature: 0.8,
    });

    return cleanResponse(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    throw new Error("Oops! Thoda technical issue hai. Try again? 🙏");
  }
};

export async function clothify(req, res, next) {
  try {
    const { messages } = req.body;
    const userId = req.user?.id;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Kuch toh bol do, yaar! No message, no magic.",
      });
    }

    const suggestion = await query(messages);

    if (userId) {
      const latestChat = await Chat.findOne({ userId }).sort({ sno: -1 });
      const newSno = latestChat ? latestChat.sno + 1 : 1;

      const lastUserMessage = messages[messages.length - 1].content;
      await Chat.create({
        userId,
        sno: newSno,
        input: lastUserMessage,
        response: suggestion,
      });
    }

    res.status(200).json({ suggestion });
  } catch (error) {
    console.error("Generation error:", error.message);
    res.status(500).json({ error: error.message });
  }
}

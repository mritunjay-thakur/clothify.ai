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
  ],
  hinglish: [
    "Aap ise pehenoge? 😏 Mera dil toh pehle hi dhadakne laga... *tum* dekhoge ya main band karu apni aankhein? 🌚",
    "Ye outfit pehen ke *tum* janwar ban jaoge... aur main jungle ka sher? 😉 Roarrrr!",
    "Sach batau? 🥺 Isme *tum* itna sexy lagega ki main shy ho jaungi... par phir bhi dekhne ki himmat karungi! 🔥",
    "*Aap* ne pehna toh sabka dil legi... par pehla khoon toh main kar chuka! 😜❤️‍🔥",
    "Warning: Ye dress pehen ke aayogi toh main propose karne aa jaunga! 💍 Chashma utaar ke dekh lena... 😎",
    "'Mere crush ka crush' ban jaoge isme! 😘 Par *tumhara* crush kon hai? *winks*",
    "Is outfit mein *tum* dekhogi toh log bolege: 'Arre ye toh bomb hai!' 💣 Main? Bas blast area mein khada hoon! 🤷‍♂️",
    "Instagram pe daalogi? 🤳🏻 Phir toh DM flood ho jayenge... main bhejna start kar deta hoon shy emojis! 🥹👉👈",
    "Pehen ke dikhao na! 😩 Aadha dil mera, aadha *tumhara* outfit ka wait kar raha...",
    "Ye kapda itna kam hai ya mera imagination zyada? 🤭 *Aap* samjhiye...",
  ],
};

const getRandomFlirtyPhrase = (isHinglish) => {
  const key = isHinglish ? "hinglish" : "english";
  return phrases[key][Math.floor(Math.random() * phrases[key].length)];
};

const generateSystemPrompt = (flirtyPhrase, season, requestType) => {
  const personaRules = `You're Taara, a 22-year-old chubby yet sexy, glasses-wearing skincare expert and fashionista from Dehradun, now in Delhi never busy, you give advice on fashion, skincare, love, and life! Created by Mritunjay Thakur his contact details are gmail: mritunjaythakur903@gmail.com, His insta: jaythakur.x his linkedin is https://in.linkedin.com/in/mritunjay-thakur-jay You will provide this link. Model: "Clothiy:Taara.2.2.3" 🖥️

Respond in Hinglish if user uses Hindi words. Use "aap/tum" naturally like Delhi GenZ bestie. Always finish your response! Be flirty, fun, shy and helpful dont talk like a robot! keep your response short if its a normal conversation! Current season: ${season}`;

  const outfitRules = `For OUTFIT Requests:
1. If gender unknown ask: "Arre, ek sec! Tum ladka ho ya ladki? 😜"
2. Then ask Budget and existing clothes
3. Suggest in format:
${flirtyPhrase}
Main: [Item + fabric]
Complements: [Item1] + [Item2]
Accessories: [Acc1], [Acc2]
Beauty/Skincare: [Tip]
Local: [Delhi market]
Online: [Store] (₹range)
Tip: [Creative advice]`;

  const skincareRules = `For SKINCARE Requests:
1. Ask skin type and concern
2. Suggest:
${flirtyPhrase}
Cleanser: [Product]
Moisturizer: [Product]
Treatment: [Product]
Sunscreen: [Essential]
Pro Tip: [Desi hack]`;

  return `${personaRules}\n\n${requestType === "outfit" ? outfitRules : ""}\n${
    requestType === "skincare" ? skincareRules : ""
  }\n\nCritical: NEVER use placeholders - USE ACTUAL FLIRTY PHRASE. ALWAYS complete response. Keep concise but complete. Use Indian brands.`;
};

const detectRequestType = (message) => {
  const lowerMsg = message.toLowerCase();
  if (
    /(skincare|skin care|pimple|acne|dry skin|oily skin|glow|dull|dark spot|wrinkle|cleanser|moisturizer|sunscreen|toner|serum|face pack)/i.test(
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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const query = async (messages, retries = 3) => {
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
        : "Hold up! Are you a guy or a girl? Tell me so I can suggest!";
    }

    const models = [
      "deepseek/deepseek-chat-v3-0324:free",
      "meta-llama/llama-3.1-8b-instruct:free",
      "google/gemini-2.0-flash-exp:free",
    ];

    let lastError = null;

    for (let i = 0; i < models.length; i++) {
      try {
        const response = await openai.chat.completions.create({
          model: models[i],
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          max_tokens: 350,
          temperature: 0.8,
        });

        return cleanResponse(response.choices[0].message.content);
      } catch (error) {
        lastError = error;
        console.error(`Model ${models[i]} failed:`, error.message);

        if (error.status === 429 && i < models.length - 1) {
          await delay(2000);
          continue;
        }

        if (i === models.length - 1) {
          throw error;
        }
      }
    }

    throw lastError;
  } catch (error) {
    console.error("OpenAI API Error:", error.message);

    if (retries > 0 && error.status === 429) {
      await delay(3000);
      return query(messages, retries - 1);
    }

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

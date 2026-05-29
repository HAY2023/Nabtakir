import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Ensure the Gemini client is initialized lazily or safely
let ai: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY holds no value. Please define it in your Secrets panel.");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Check status
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Map of pre-defined system instruction tones
const TONE_INSTRUCTIONS: Record<string, string> = {
  friendly_arabic: "كن صديقاً ودوداً ومحفزاً جداً. أجب بابتسامة ولطف وذكاء باللغة العربية البسيطة والممتعة.",
  formal_arabic: "تحدث بلغة عربية فصحى رصينة ومهنية وموجزة ومحترمة للغاية.",
  funny_arabic: "أجب بطريقة مرحة، مضحكة وساخرة بعض الشيء، استخدم اللهجة أو التعابير الفكاهية العربية مع الحفاظ على الفائدة.",
  poetic_arabic: "أجب بأسلوب أدبي بليغ، استخدم تشبيهات شعرية وكلمات رنانة وتعبيرات أدبية غنية باللغة العربية الفصحى.",
  professional_arabic: "أنت مستشار أعمال خبير في ريادة الأعمال وصناعة القرار. أجب بشكل عملي، منظم، ومباشر.",
  english_tech: "You are a tech-savvy software consultant. Speak clear, modern English, use markdown formatting, code snippets when relevant, and explain technical topics cleanly."
};

// API: Handle Custom AI Training Chat
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { messages, botConfig } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Missing or invalid 'messages' array in request body." });
      return;
    }

    const config = botConfig || { name: "مُساعد ذكي", tone: "friendly_arabic", rules: [], qaDatabase: [] };
    const botName = config.name || "نبتكرة";
    const selectedTone = config.tone || "friendly_arabic";
    const rulesList = config.rules || [];
    const qaList = config.qaDatabase || [];
    const topicsList = config.topics || [];

    // Construct highly personalized, strict system instructions
    const toneText = TONE_INSTRUCTIONS[selectedTone] || TONE_INSTRUCTIONS.friendly_arabic;
    
    let systemInstruction = `أنت مساعد ذكي اسمه "${botName}".
تعليمات النبرة والشخصية: ${toneText}

--- المرجع الأساسي والأول للمعلومات المشفرة (المواضيع والمذكرات) ---
إذا كان سؤال المستخدم أو الحوار يتعلق بأي من المواضيع المذكورة أدناه، فيجب عليك الاعتماد المطلق والحصري على المعلومات الموجودة تحتها فقط.
أجب بشكل مباشر، دقيق، وموجز، وابتعد تماماً عن الحشو والمقدمات الطويلة أو تكرار عبارات المجاملة (مثلاً لا تقل: "بصفتي صديقك... يسعدني أن أؤكد لك..."). ادخل في صلب الموضوع فوراً باستخدام المعلومات المحفوظة فقط.
يُحظر عليك تماماً إضافة أي معلومات، حقائق، أو تفاصيل من عندك لم تُذكر في النص المحفوظ. التزم بحدود المعلومات المكتوبة.
إذا لم يكن سؤال المستخدم متعلقاً بأي من هذه المواضيع، حينها فقط يمكنك استخدام معرفتك العامة والذكاء الاصطناعي للإجابة بشكل طبيعي.

${topicsList.length > 0
  ? topicsList.map((t: any, i: number) => `[موضوع ${i+1}: ${t.title}]\nالمعلومات المرجعية: ${t.content}`).join("\n\n")
  : "لم يقم المدرب بإضافة أي مواضيع مرجعية حتى الآن."}

--- قواعد السلوك الإجبارية ---
هذه قواعد تلقنها لك المدرب ويجب ألا تنتهكها أبداً أثناء المحادثة:
${rulesList.length > 0 
  ? rulesList.map((rule: string, i: number) => `- ${rule}`).join("\n") 
  : "- لا توجد قواعد إضافية، ابق على طبيعتك وإرشادات النبرة."}

--- الإجابات السريعة المبرمجة مسبقاً (Q&A) ---
إذا سألك عن سؤال مشابه جداً للأسئلة التالية، أجب بالإجابة المبرمجة:
${qaList.length > 0 
  ? qaList.map((qa: { question: string; answer: string }) => `س: "${qa.question}" | ج: "${qa.answer}"`).join("\n") 
  : "- لا توجد أسئلة مبرمجة."}`;

    const client = getGeminiClient();
    
    // Map client messages to Gemini contents structure
    // If the format supplied by client is custom ({ sender: 'user' | 'bot', text: string }), map it.
    // If it's already { role, parts }, use that.
    const mappedContents = messages.map((m: any) => {
      const role = m.sender === "bot" ? "model" : (m.role === "model" ? "model" : "user");
      const text = m.text || m.content || "";
      return {
        role,
        parts: [{ text }]
      };
    });

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: mappedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      }
    });

    const textResult = response.text || "عذراً، لم أستطع توليد إجابة حالياً.";

    res.json({
      text: textResult,
      systemInstructionUsed: systemInstruction, // useful for educational preview in UI!
    });
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ 
      error: "حدث خطأ أثناء معالجة طلبك مع نموذج الذكاء الاصطناعي.",
      details: error.message || String(error)
    });
  }
});

// Configure Vite middleware or Static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] running on http://localhost:${PORT} under ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();

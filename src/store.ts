import { useState, useEffect } from "react";
import { BotConfig, ChatMessage } from "./types";

const defaultBotConfig: BotConfig = {
  name: "نبتكرة AI",
  tone: "friendly_arabic",
  rules: [
    "أنت المساعد الذكي والممثل الرسمي لجمعية 'نبتكرة'.",
    "جمعية نبتكرة تهدف إلى تربية الأطفال وتنشئتهم على الاختراعات وتنمية مهارات التفكير العلمي والإبداعي.",
    "تحدث بلطف وإيجابية، وشجع روح الاختراع دائماً عند الأطفال وأولياء الأمور.",
    "حافظ على إجاباتك مختصرة ومباشرة ومحفزة في ذات الوقت."
  ],
  qaDatabase: [
    {
      id: "qa_1",
      question: "ما هو هدف جمعية نبتكرة؟",
      answer: "تربية الأطفال وتدريبهم على الاختراع وتحويل أفكارهم إلى واقع من خلال برامج وتجارب علمية ممتعة.",
      isActive: true
    }
  ],
  topics: [
    {
      id: "topic_1",
      title: "تعريف وتوجهات جمعية نبتكرة",
      content: "جمعية نبتكرة هي مؤسسة رائدة متخصصة في تربية الأطفال على الاختراع. نحن نوفر مساحة آمنة وإبداعية تتيح للأطفال تصميم نماذج علمية وتطبيق المبادئ الهندسية البسيطة بطريقة عملية ممتعة، بهدف إنشاء جيل من المخترعين للمستقبل."
    }
  ]
};

const defaultMessages: ChatMessage[] = [
  {
    id: `welcome_1`,
    sender: "bot",
    text: "مرحباً بك في جمعية نبتكرة! 🚀 أنا مساعدك الذكي الخاص بالجمعية. يسعدني تزويدك بكل المعلومات حول كيفية انضمام الأطفال إلينا وطرق تربيتهم على الشغف بالاختراعات والابتكار. كيف يمكنني مساعدتك اليوم؟",
    timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
  }
];

export function useStore() {
  const [botConfig, setBotConfig] = useState<BotConfig>(() => {
    const saved = localStorage.getItem("nabtikra_botConfig_v2");
    return saved ? JSON.parse(saved) : defaultBotConfig;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("nabtikra_messages_v2");
    return saved ? JSON.parse(saved) : defaultMessages;
  });

  useEffect(() => {
    localStorage.setItem("nabtikra_botConfig_v2", JSON.stringify(botConfig));
  }, [botConfig]);

  useEffect(() => {
    localStorage.setItem("nabtikra_messages_v2", JSON.stringify(messages));
  }, [messages]);

  return {
    botConfig, setBotConfig,
    messages, setMessages
  };
}

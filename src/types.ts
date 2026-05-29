export type BotTone = 
  | "friendly_arabic"
  | "formal_arabic"
  | "funny_arabic"
  | "poetic_arabic"
  | "professional_arabic"
  | "english_tech";

export interface QAPair {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
}

export interface TopicInfo {
  id: string;
  title: string;
  content: string;
}

export interface BotConfig {
  name: string;
  tone: BotTone;
  rules: string[]; // custom instructions / guidelines list
  qaDatabase: QAPair[]; // knowledge base entries
  topics: TopicInfo[]; // detailed topics knowledge base
}

export type SenderType = "user" | "bot" | "system";

export interface ChatMessage {
  id: string;
  sender: SenderType;
  text: string;
  timestamp: string;
}

export interface PresetTopicConfig {
  label: string;
  rules: string[];
  qaDatabase: { question: string; answer: string }[];
  tone: BotTone;
  botName: string;
  description: string;
}

import React, { useState, useEffect } from "react";
import { Settings, Sliders, Terminal, Plus, Trash2, BookOpen, Sparkles, Home, FileText, Cpu, Activity, CheckCircle2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { useStore } from "./store";
import { BotTone, QAPair, TopicInfo } from "./types";
import { PRESET_TEMPLATES } from "./presets";

const TONE_NAMES: Record<BotTone, { ar: string; emoji: string; desc: string }> = {
  friendly_arabic: { ar: "صديق ممتع وودود", emoji: "🌸", desc: "يجيب بلطف وابتسام ومحفز للحديث" },
  formal_arabic: { ar: "فصيح ومهني رصين", emoji: "👔", desc: "يتكلم باللغة الفصحى الرصينة" },
  funny_arabic: { ar: "فكاهي وساخر", emoji: "🤪", desc: "يجيب بطرافة ودعابة ساخرة" },
  poetic_arabic: { ar: "شاعر أديب بليغ", emoji: "✍️", desc: "غني بالتشبيهات الأدبية" },
  professional_arabic: { ar: "مستشار أعمال وريادة", emoji: "📊", desc: "مباشر، عملي، تنفيذي" },
  english_tech: { ar: "خبير ومستشار تقني (ENG)", emoji: "💻", desc: "Speaks modern English, tech consulting" }
};

export function AdminPage() {
  const { botConfig, setBotConfig, setMessages } = useStore();
  
  const [newRule, setNewRule] = useState("");
  const [newQA, setNewQA] = useState({ question: "", answer: "" });
  const [newTopic, setNewTopic] = useState({ title: "", content: "" });

  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState("");

  const simulateTraining = () => {
    if (isTraining) return;
    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingStatus("تهيئة الخلايا العصبية...");

    const steps = [
      { progress: 20, status: "تشفير القواعد ومعالجة سياق الموضوعات..." },
      { progress: 45, status: "تدريب الذاكرة طويلة المدى (المذكرات)..." },
      { progress: 70, status: "حقن الأسئلة الشائعة في نقاط التشابك العصبي الأساسية..." },
      { progress: 90, status: "ضبط أوزان النبرة والشخصية..." },
      { progress: 100, status: "اكتمل التدريب وحقن الوعي بنجاح!" }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setTrainingProgress(steps[currentStep].progress);
        setTrainingStatus(steps[currentStep].status);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsTraining(false), 3000); // Reset after 3 seconds
      }
    }, 1200);
  };


  const handleLoadPreset = (key: keyof typeof PRESET_TEMPLATES) => {
    const preset = PRESET_TEMPLATES[key];
    const mappedQA: QAPair[] = preset.qaDatabase.map((qa, index) => ({
      id: `qa_loaded_${index}_${Date.now()}`,
      question: qa.question,
      answer: qa.answer,
      isActive: true
    }));

    setBotConfig({
      name: preset.botName,
      tone: preset.tone,
      rules: [...preset.rules],
      qaDatabase: mappedQA
    });

    setMessages([{
      id: `welcome_${Date.now()}`,
      sender: "bot",
      text: `تم تحميل قالب [${preset.label}] بنجاح! تم نقل القواعد والبيانات المعرفية إلى ذهني الرقمي. يمكنك البدء بمحاورتي الآن.`,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    }]);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.trim()) return;
    setBotConfig(prev => ({ ...prev, rules: [...prev.rules, newRule.trim()] }));
    setNewRule("");
  };

  const handleRemoveRule = (index: number) => {
    setBotConfig(prev => ({ ...prev, rules: prev.rules.filter((_, i) => i !== index) }));
  };

  const handleAddQA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQA.question.trim() || !newQA.answer.trim()) return;
    const item: QAPair = {
      id: `qa_${Date.now()}`,
      question: newQA.question.trim(),
      answer: newQA.answer.trim(),
      isActive: true
    };
    setBotConfig(prev => ({ ...prev, qaDatabase: [...prev.qaDatabase, item] }));
    setNewQA({ question: "", answer: "" });
  };

  const handleRemoveQA = (id: string) => {
    setBotConfig(prev => ({ ...prev, qaDatabase: prev.qaDatabase.filter(qa => qa.id !== id) }));
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.title.trim() || !newTopic.content.trim()) return;
    const item: TopicInfo = {
      id: `topic_${Date.now()}`,
      title: newTopic.title.trim(),
      content: newTopic.content.trim()
    };
    setBotConfig(prev => ({ ...prev, topics: [...(prev.topics || []), item] }));
    setNewTopic({ title: "", content: "" });
  };

  const handleRemoveTopic = (id: string) => {
    setBotConfig(prev => ({ ...prev, topics: (prev.topics || []).filter(t => t.id !== id) }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans selection:bg-indigo-500 selection:text-white" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-indigo-700 flex items-center gap-3">
              <Settings className="w-8 h-8 text-indigo-600" />
              إعدادات نبتكرة AI
            </h1>
            <p className="text-slate-600 mt-2 text-sm font-medium">هنا يمكنك تدريب البوت وإضافة قواعده ومعرفته الخاصة في الكواليس.</p>
          </div>
          <Link to="/" className="flex shrink-0 items-center gap-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl transition-all font-bold text-sm shadow-sm">
            <Home className="w-4 h-4" />
            العودة للمحادثة
          </Link>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-3 flex-wrap bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-sm text-slate-600 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            نماذج تدريب جاهزة:
          </span>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(PRESET_TEMPLATES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleLoadPreset(key as keyof typeof PRESET_TEMPLATES)}
                className="text-xs bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-300 text-slate-700 px-3 py-2 rounded-lg font-bold"
              >
                {value.botName}
              </button>
            ))}
          </div>
        </div>

        {/* Neural Network Training Visuals */}
        <div className="bg-indigo-900 rounded-3xl border border-indigo-700 p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 text-white">
              <div className={`p-3 rounded-2xl ${isTraining ? 'bg-indigo-500/30' : 'bg-indigo-800'} border border-indigo-500/50`}>
                <Cpu className={`w-8 h-8 ${isTraining ? 'text-indigo-300 animate-pulse' : 'text-indigo-400'}`} />
              </div>
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  مركز تدريب الخلايا العصبية
                  {isTraining && <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />}
                </h3>
                <p className="text-indigo-300 text-sm font-medium mt-1">اضغط هنا بعد تحديث الإعدادات لتدريب محرك الذكاء الاصطناعي وبناء الترابطات العصبية الجديدة.</p>
              </div>
            </div>
            
            <button
              onClick={simulateTraining}
              disabled={isTraining}
              className={`shrink-0 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                isTraining 
                  ? 'bg-indigo-800/50 text-indigo-300 cursor-not-allowed border border-indigo-700/50'
                  : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/20 active:scale-95'
              }`}
            >
              {isTraining ? 'جاري التدريب النشط...' : 'بدء تدريب الشبكة'}
              {!isTraining && <Zap className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence>
            {isTraining && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="relative z-10"
              >
                <div className="bg-indigo-950/50 rounded-xl p-4 border border-indigo-800/50">
                  <div className="flex justify-between text-xs font-bold text-indigo-300 mb-2">
                    <span>{trainingStatus}</span>
                    <span>{Math.round(trainingProgress)}%</span>
                  </div>
                  <div className="h-2.5 bg-indigo-900 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${trainingProgress}%` }}
                      transition={{ ease: "easeInOut" }}
                    />
                  </div>
                  {trainingProgress === 100 && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="flex items-center gap-2 text-emerald-400 text-sm font-bold mt-3 justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      تم التحديث والتدريب بنجاح! يمكن للبوت الآن استخدام المعلومات الجديدة.
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Identity Block */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-black text-slate-800">هوية ونبرة البوت الأساسية</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">اسم البوت الرقمي:</label>
                <input
                  type="text"
                  value={botConfig.name}
                  onChange={(e) => setBotConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-all font-medium"
                  placeholder="مثال: البوت الرياضي..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">النبرة (الأسلوب):</label>
                <select
                  value={botConfig.tone}
                  onChange={(e) => setBotConfig(prev => ({ ...prev, tone: e.target.value as BotTone }))}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-all appearance-none cursor-pointer font-medium"
                >
                  {Object.entries(TONE_NAMES).map(([key, val]) => (
                    <option key={key} value={key}>{val.emoji} {val.ar}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Rules Block */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-600" />
                <h2 className="text-base font-black text-slate-800">التعليمات والقواعد (Rules)</h2>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 font-bold">{botConfig.rules.length} قواعد</span>
            </div>
            <p className="text-sm text-slate-500 font-medium">القواعد هي أوامر صارمة يتبعها البوت عند تقديم أي إجابة.</p>
            <form onSubmit={handleAddRule} className="flex gap-2">
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="ضع قاعدة جديدة... (مثال: لا تُجب باللغة الإنجليزية)"
                className="flex-1 bg-slate-50 border border-slate-300 focus:border-purple-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-all font-medium"
              />
              <button disabled={!newRule.trim()} type="submit" className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4"/> لقنّه القاعدة
              </button>
            </form>
            <div className="flex flex-col gap-3 mt-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-2">
              <AnimatePresence>
                {botConfig.rules.map((rule, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex justify-between items-start gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-purple-600 bg-purple-100 h-6 w-6 rounded-full flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed pt-0.5">{rule}</p>
                      </div>
                      <button onClick={() => handleRemoveRule(idx)} className="text-slate-400 hover:text-red-500 p-1 opacity-100 hover:bg-slate-100 rounded transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Topics & Fixed Notes Block (NEW) */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-black text-slate-800">مواضيع ثابتة ونص معلومات (مذكرات)</h2>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 font-bold">{(botConfig.topics || []).length} مواضيع</span>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              أضف موضوعاً ونصاً، وعندما يُسأل البوت عنه، سيعطيه للمستخدم بصياغة ممتازة <strong>بدون تغيير أي حقيقة أو معلومة منه أبداً</strong>.
            </p>
            <form onSubmit={handleAddTopic} className="flex flex-col gap-3">
              <input
                type="text"
                value={newTopic.title}
                onChange={(e) => setNewTopic(prev => ({ ...prev, title: e.target.value }))}
                placeholder="اسم الموضوع (مثال: معلومات عن منتج X)"
                className="bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-all font-bold"
              />
              <textarea
                value={newTopic.content}
                onChange={(e) => setNewTopic(prev => ({ ...prev, content: e.target.value }))}
                placeholder="النص والمعلومات الثابتة التي تريده أن يلتزم بها حرفياً..."
                rows={3}
                className="bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-all resize-none font-medium"
              />
              <button disabled={!newTopic.title.trim() || !newTopic.content.trim()} type="submit" className="bg-emerald-600 self-start hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> حفظ الموضوع
              </button>
            </form>

            <div className="grid grid-cols-1 gap-4 mt-2 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-2 pb-2">
                <AnimatePresence>
                  {(botConfig.topics || []).map(topic => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative group transition-colors hover:border-emerald-200"
                    >
                      <button onClick={() => handleRemoveTopic(topic.id)} className="absolute top-3 left-3 text-slate-400 hover:text-red-500 bg-white p-1.5 rounded-lg opacity-100 transition-opacity border border-slate-200 shadow-sm hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <h4 className="text-sm font-bold text-emerald-700 mb-2 border-b border-emerald-200 pb-2">{topic.title}</h4>
                      <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap">{topic.content}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
            </div>
          </div>

          {/* QA Base Block */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-black text-slate-800">الأسئلة السريعة (Q&A)</h2>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 font-bold">{botConfig.qaDatabase.length} رد سريع</span>
            </div>
            <p className="text-sm text-slate-500 font-medium">لقن البوت حقائق وجواب مباشر لأسئلة شائعة.</p>
            <form onSubmit={handleAddQA} className="flex flex-col gap-3">
              <input
                type="text"
                value={newQA.question}
                onChange={(e) => setNewQA(prev => ({ ...prev, question: e.target.value }))}
                placeholder="السؤال التدريبي..."
                className="bg-slate-50 border border-slate-300 focus:border-blue-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-all font-medium"
              />
              <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    value={newQA.answer}
                    onChange={(e) => setNewQA(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="الإجابة المستهدفة التي تريد أن يرد بها..."
                    className="flex-1 bg-slate-50 border border-slate-300 focus:border-blue-500 rounded-xl py-3 px-4 text-sm text-slate-900 outline-none transition-all font-medium"
                  />
                  <button disabled={!newQA.question.trim() || !newQA.answer.trim()} type="submit" className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed justify-center text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> حفظ الرد
                  </button>
              </div>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-2 pb-2">
                <AnimatePresence>
                  {botConfig.qaDatabase.map(qa => (
                    <motion.div
                      key={qa.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative group transition-colors hover:border-slate-300"
                    >
                      <button onClick={() => handleRemoveQA(qa.id)} className="absolute top-3 left-3 text-slate-400 hover:text-red-500 bg-white p-1.5 rounded-lg opacity-100 transition-opacity border border-slate-200 shadow-sm hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-blue-700 font-bold mb-2 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span> س: {qa.question}</p>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed p-2 bg-white rounded-lg border border-slate-100">ج: {qa.answer}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

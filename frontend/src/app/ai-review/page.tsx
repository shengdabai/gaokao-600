"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import {
  PenLine,
  Scale,
  Camera,
  Search,
  Loader2,
  Send,
  Upload,
  Image as ImageIcon,
  X,
  BookOpen,
} from "lucide-react";
import {
  chineseReview,
  politicsReview,
  analyzeImage,
  searchNotes,
  reviewEnglish,
} from "@/lib/api";
import { SUBJECTS } from "@/lib/subjects";
import SubjectBadge from "@/components/SubjectBadge";

type Tab = "essay" | "politics" | "english" | "photo" | "notes";

const tabs: { id: Tab; label: string; icon: React.ElementType; iconText?: string }[] = [
  { id: "essay", label: "语文批改", icon: PenLine },
  { id: "politics", label: "政治批改", icon: Scale },
  { id: "english", label: "英语批改", icon: BookOpen },
  { id: "photo", label: "拍题讲解", icon: Camera },
  { id: "notes", label: "笔记搜索", icon: Search },
];

export default function AIReviewPage() {
  const [activeTab, setActiveTab] = useState<Tab>("essay");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          AI智能批改
        </h1>
        <p className="text-slate-500 mt-1">AI助力精准提分</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {activeTab === "essay" && <EssayTab />}
          {activeTab === "politics" && <PoliticsTab />}
          {activeTab === "english" && <EnglishTab />}
          {activeTab === "photo" && <PhotoTab />}
          {activeTab === "notes" && <NotesTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function EssayTab() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await chineseReview(text);
      setFeedback(res.feedback);
    } catch (err: any) {
      setError(err.message || "批改失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-3xl p-5 lg:p-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          语文作文批改
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="粘贴或输入你的作文内容..."
          rows={10}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm resize-none font-serif leading-relaxed"
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-slate-400">
            {text.length} 字
          </span>
          <button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {loading ? "批改中..." : "开始批改"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-5 lg:p-8 space-y-5"
        >
          <h2 className="text-lg font-semibold text-slate-800">批改结果</h2>
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="markdown-body text-sm">
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function PoliticsTab() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!question.trim() || !answer.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await politicsReview(question, answer);
      setFeedback(res.feedback);
    } catch (err: any) {
      setError(err.message || "批改失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-3xl p-5 lg:p-8 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">政治主观题批改</h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            题目
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="输入政治主观题题目..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            你的答案
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="输入你的作答内容..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm resize-none"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading || !question.trim() || !answer.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {loading ? "批改中..." : "开始批改"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-5 lg:p-8 space-y-5"
        >
          <h2 className="text-lg font-semibold text-slate-800">批改结果</h2>
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="markdown-body text-sm">
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function EnglishTab() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await reviewEnglish(text);
      setFeedback(res.feedback);
    } catch (err: any) {
      setError(err.message || "批改失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-3xl p-5 lg:p-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          英语作文批改
        </h2>
        <p className="text-sm text-slate-500 mb-3">
          粘贴英语作文或书面表达，AI帮你批改语法、用词和结构
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your English essay here..."
          rows={10}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {text.length} 字符
            </span>
            <span className="text-xs text-slate-400">
              {wordCount} 词
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {loading ? "批改中..." : "开始批改"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-5 lg:p-8 space-y-5"
        >
          <h2 className="text-lg font-semibold text-slate-800">批改结果</h2>
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="markdown-body text-sm">
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function PhotoTab() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      // Extract base64 data (remove data:image/...;base64, prefix)
      const base64 = result.split(",")[1];
      setBase64Data(base64);
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setPreview(null);
    setBase64Data(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit() {
    if (!base64Data) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeImage(base64Data, subject || undefined);
      setFeedback(res.feedback);
    } catch (err: any) {
      setError(err.message || "分析失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-3xl p-5 lg:p-8 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">拍题讲解</h2>
        <p className="text-sm text-slate-500">
          上传题目图片，AI帮你分析解答
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {!preview ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-16 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center gap-3 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition"
          >
            <Upload size={32} />
            <span className="text-sm font-medium">
              点击上传题目图片
            </span>
            <span className="text-xs">支持 JPG、PNG 格式</span>
          </button>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="题目预览"
              className="w-full max-h-96 object-contain rounded-2xl bg-slate-100"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:border-indigo-400 outline-none"
          >
            <option value="">科目（可选）</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
          <div className="flex-1" />
          <button
            onClick={handleSubmit}
            disabled={loading || !base64Data}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Camera size={18} />
            )}
            {loading ? "分析中..." : "开始分析"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-5 lg:p-8 space-y-5"
        >
          <h2 className="text-lg font-semibold text-slate-800">解题分析</h2>
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="markdown-body text-sm">
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function NotesTab() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await searchNotes(query, subject || undefined);
      setFeedback(data.feedback);
    } catch (err: any) {
      setError(err.message || "搜索失败");
      setFeedback(null);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-3xl p-5 lg:p-8 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">笔记搜索</h2>
        <p className="text-sm text-slate-500">
          按知识点搜索学习笔记
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索知识点..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
            />
          </div>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:border-indigo-400 outline-none"
          >
            <option value="">全部科目</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            搜索
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {searched && !loading && !feedback && (
        <div className="glass-card rounded-3xl p-8 text-center">
          <Search size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">未找到相关笔记</p>
        </div>
      )}

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 lg:p-5"
        >
          <div className="markdown-body text-sm">
            <ReactMarkdown>{feedback}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}

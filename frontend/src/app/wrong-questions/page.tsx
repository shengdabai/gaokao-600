"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import {
  Plus,
  Filter,
  Check,
  X,
  RotateCcw,
  BookOpen,
  Loader2,
  ChevronDown,
  Camera,
  Trash2,
  Sparkles,
  Send,
  Upload,
} from "lucide-react";
import {
  createWrongQuestion,
  getWrongQuestions,
  updateWrongQuestion,
  deleteWrongQuestion,
  recognizeQuestion,
  generateSimilarQuestions,
  checkAnswer,
} from "@/lib/api";
import { SUBJECTS, getSubjectName } from "@/lib/subjects";
import SubjectBadge from "@/components/SubjectBadge";
import type { WrongQuestion, WrongQuestionCreate } from "@/types";

const MASTERY_LABELS: Record<string, { text: string; color: string }> = {
  not_mastered: { text: "未掌握", color: "text-amber-500" },
  reviewing: { text: "复习中", color: "text-blue-500" },
  mastered: { text: "已掌握", color: "text-emerald-500" },
};

export default function WrongQuestionsPage() {
  const [questions, setQuestions] = useState<WrongQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterKP, setFilterKP] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Photo recognition state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Similar questions state
  const [expandedSimilar, setExpandedSimilar] = useState<string | null>(null);
  const [similarLoading, setSimilarLoading] = useState<string | null>(null);
  const [similarResults, setSimilarResults] = useState<Record<string, string>>(
    {}
  );
  const [similarAnswers, setSimilarAnswers] = useState<
    Record<string, Record<number, string>>
  >({});
  const [checkingAnswer, setCheckingAnswer] = useState<string | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<
    Record<string, Record<number, string>>
  >({});

  const [form, setForm] = useState<WrongQuestionCreate>({
    subject: "chinese",
    question_text: "",
    user_answer: "",
    correct_answer: "",
    error_reason: "",
    knowledge_point: "",
  });

  useEffect(() => {
    loadQuestions();
  }, [filterSubject, filterKP]);

  async function loadQuestions() {
    setLoading(true);
    try {
      const data = await getWrongQuestions({
        subject: filterSubject || undefined,
        knowledge_point: filterKP || undefined,
      });
      setQuestions(data);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  // Photo upload handler
  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      const base64 = result.split(",")[1];
      setPhotoBase64(base64);
    };
    reader.readAsDataURL(file);
  }

  function clearPhoto() {
    setPhotoPreview(null);
    setPhotoBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleRecognize() {
    if (!photoBase64) return;
    setRecognizing(true);
    setError(null);
    try {
      const recognized = await recognizeQuestion(
        photoBase64,
        form.subject || undefined
      );
      setForm((prev) => ({
        ...prev,
        subject: recognized.subject || prev.subject,
        question_text: recognized.question_text || prev.question_text,
        user_answer: recognized.user_answer || prev.user_answer,
        correct_answer: recognized.correct_answer || prev.correct_answer,
        error_reason: recognized.error_reason || prev.error_reason,
        knowledge_point: recognized.knowledge_point || prev.knowledge_point,
      }));
    } catch (err: any) {
      setError(err.message || "AI识别失败，请手动填写");
    } finally {
      setRecognizing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.question_text.trim()) {
      setError("请输入题目内容");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const q = await createWrongQuestion(form);
      setQuestions((prev) => [q, ...prev]);
      setForm({
        subject: "chinese",
        question_text: "",
        user_answer: "",
        correct_answer: "",
        error_reason: "",
        knowledge_point: "",
      });
      clearPhoto();
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "添加失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("确定要删除这道错题吗？")) return;
    try {
      await deleteWrongQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch {
      // Ignore
    }
  }

  async function handleCycleMastery(q: WrongQuestion) {
    const cycle: Record<string, string> = {
      not_mastered: "reviewing",
      reviewing: "mastered",
      mastered: "not_mastered",
    };
    const nextStatus = cycle[q.mastery_status] || "not_mastered";
    try {
      const updated = await updateWrongQuestion(q.id, {
        mastery_status: nextStatus,
      });
      setQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? updated : item))
      );
    } catch {
      // Ignore
    }
  }

  // Similar questions (举一反三)
  async function handleSimilarQuestions(q: WrongQuestion) {
    if (expandedSimilar === q.id) {
      setExpandedSimilar(null);
      return;
    }
    setExpandedSimilar(q.id);

    if (similarResults[q.id]) return; // Already loaded

    setSimilarLoading(q.id);
    try {
      const res = await generateSimilarQuestions({
        question_text: q.question_text,
        subject: q.subject,
        knowledge_point: q.knowledge_point,
        error_reason: q.error_reason,
      });
      setSimilarResults((prev) => ({ ...prev, [q.id]: res.feedback }));
    } catch {
      setSimilarResults((prev) => ({
        ...prev,
        [q.id]: "生成失败，请重试。",
      }));
    } finally {
      setSimilarLoading(null);
    }
  }

  async function handleCheckAnswer(
    q: WrongQuestion,
    questionIndex: number,
    questionText: string
  ) {
    const answer = similarAnswers[q.id]?.[questionIndex];
    if (!answer?.trim()) return;

    setCheckingAnswer(`${q.id}-${questionIndex}`);
    try {
      const res = await checkAnswer({
        question: questionText,
        subject: q.subject,
        user_answer: answer,
      });
      setAnswerFeedback((prev) => ({
        ...prev,
        [q.id]: { ...(prev[q.id] || {}), [questionIndex]: res.feedback },
      }));
    } catch {
      setAnswerFeedback((prev) => ({
        ...prev,
        [q.id]: {
          ...(prev[q.id] || {}),
          [questionIndex]: "检查失败，请重试。",
        },
      }));
    } finally {
      setCheckingAnswer(null);
    }
  }

  const knowledgePoints = [
    ...new Set(questions.map((q) => q.knowledge_point).filter(Boolean)),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            错题本
          </h1>
          <p className="text-slate-500 mt-1">记录错题，智能复习</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "取消" : "添加错题"}
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="glass-card rounded-3xl p-5 lg:p-8 space-y-4 overflow-hidden"
          >
            <h2 className="text-lg font-semibold text-slate-800">添加错题</h2>

            {/* Photo Upload Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                拍照识别（可选）
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {!photoPreview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-10 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center gap-2 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition"
                >
                  <Camera size={28} />
                  <span className="text-sm font-medium">
                    拍照或上传题目图片
                  </span>
                  <span className="text-xs">支持拍照、JPG、PNG 格式</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="题目预览"
                      className="w-full max-h-64 object-contain rounded-2xl bg-slate-100"
                    />
                    <button
                      type="button"
                      onClick={clearPhoto}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleRecognize}
                    disabled={recognizing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 transition text-sm"
                  >
                    {recognizing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    {recognizing ? "AI识别中..." : "AI识别"}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  科目
                </label>
                <select
                  value={form.subject}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm bg-white"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  知识点
                </label>
                <input
                  type="text"
                  value={form.knowledge_point}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      knowledge_point: e.target.value,
                    }))
                  }
                  placeholder="例：三角函数"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                题目内容
              </label>
              <textarea
                value={form.question_text}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    question_text: e.target.value,
                  }))
                }
                placeholder="粘贴或输入题目内容..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  我的答案
                </label>
                <textarea
                  value={form.user_answer}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      user_answer: e.target.value,
                    }))
                  }
                  placeholder="我写的答案..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  正确答案
                </label>
                <textarea
                  value={form.correct_answer}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      correct_answer: e.target.value,
                    }))
                  }
                  placeholder="正确答案..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                错误原因
              </label>
              <textarea
                value={form.error_reason}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    error_reason: e.target.value,
                  }))
                }
                placeholder="分析错误原因..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Plus size={18} />
                )}
                {submitting ? "添加中..." : "添加"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="appearance-none pl-4 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
          >
            <option value="">全部科目</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
        {knowledgePoints.length > 0 && (
          <div className="relative">
            <select
              value={filterKP}
              onChange={(e) => setFilterKP(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              <option value="">全部知识点</option>
              {knowledgePoints.map((kp) => (
                <option key={kp} value={kp}>
                  {kp}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}
      </div>

      {/* Question List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="loader" />
        </div>
      ) : questions.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <BookOpen size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">暂无错题记录</p>
          <p className="text-slate-400 text-sm mt-1">
            点击「添加错题」开始整理
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {questions.map((q, i) => {
            const mastery =
              MASTERY_LABELS[q.mastery_status] || MASTERY_LABELS.not_mastered;
            const isMastered = q.mastery_status === "mastered";
            const isExpanded = expandedSimilar === q.id;
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`glass-card rounded-2xl p-4 lg:p-5 space-y-3 ${
                  isMastered ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SubjectBadge subject={q.subject} size="sm" />
                    {q.knowledge_point && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {q.knowledge_point}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                      复习{q.review_count}次
                    </span>
                    <button
                      onClick={() => handleCycleMastery(q)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                        isMastered
                          ? "bg-emerald-500 text-white"
                          : q.mastery_status === "reviewing"
                          ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                          : "bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600"
                      }`}
                      title={mastery.text}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition"
                      title="删除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="font-serif text-sm text-slate-800 leading-relaxed">
                  {q.question_text.length > 150
                    ? q.question_text.slice(0, 150) + "..."
                    : q.question_text}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-rose-50 rounded-lg p-2">
                    <p className="text-rose-400 font-medium mb-0.5">我的答案</p>
                    <p className="text-rose-700">{q.user_answer || "-"}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-2">
                    <p className="text-emerald-400 font-medium mb-0.5">
                      正确答案
                    </p>
                    <p className="text-emerald-700">
                      {q.correct_answer || "-"}
                    </p>
                  </div>
                </div>

                {q.error_reason && (
                  <div className="bg-amber-50 rounded-lg p-2 text-xs">
                    <p className="text-amber-500 font-medium mb-0.5">
                      错误原因
                    </p>
                    <p className="text-amber-800">{q.error_reason}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <RotateCcw size={12} />
                    下次复习: {q.next_review_date || "待定"}
                  </span>
                  <span className={`font-medium ${mastery.color}`}>
                    {mastery.text}
                  </span>
                </div>

                {/* 举一反三 Button */}
                <button
                  onClick={() => handleSimilarQuestions(q)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-50 text-violet-700 rounded-xl font-medium hover:bg-violet-100 transition text-sm"
                >
                  <Sparkles size={16} />
                  {isExpanded ? "收起" : "举一反三"}
                </button>

                {/* Similar Questions Expanded Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-violet-50 rounded-2xl p-4 space-y-4">
                        {similarLoading === q.id ? (
                          <div className="flex items-center justify-center py-8 gap-2 text-violet-600">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-sm">正在生成类似题目...</span>
                          </div>
                        ) : similarResults[q.id] ? (
                          <>
                            <div className="markdown-body text-sm">
                              <ReactMarkdown>
                                {similarResults[q.id]}
                              </ReactMarkdown>
                            </div>

                            {/* Answer input area */}
                            <div className="space-y-3 border-t border-violet-200 pt-4">
                              <p className="text-sm font-medium text-violet-700">
                                写下你的答案
                              </p>
                              <textarea
                                value={similarAnswers[q.id]?.[0] || ""}
                                onChange={(e) =>
                                  setSimilarAnswers((prev) => ({
                                    ...prev,
                                    [q.id]: {
                                      ...(prev[q.id] || {}),
                                      0: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="输入你的答案..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-violet-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-sm resize-none bg-white"
                              />
                              <div className="flex justify-end">
                                <button
                                  onClick={() =>
                                    handleCheckAnswer(
                                      q,
                                      0,
                                      similarResults[q.id]
                                    )
                                  }
                                  disabled={
                                    checkingAnswer === `${q.id}-0` ||
                                    !similarAnswers[q.id]?.[0]?.trim()
                                  }
                                  className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 transition text-sm"
                                >
                                  {checkingAnswer === `${q.id}-0` ? (
                                    <Loader2
                                      size={16}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Send size={16} />
                                  )}
                                  {checkingAnswer === `${q.id}-0`
                                    ? "检查中..."
                                    : "提交检查"}
                                </button>
                              </div>

                              {/* Answer feedback */}
                              {answerFeedback[q.id]?.[0] && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-white rounded-xl p-4 border border-violet-200"
                                >
                                  <p className="text-sm font-medium text-violet-700 mb-2">
                                    AI反馈
                                  </p>
                                  <div className="markdown-body text-sm">
                                    <ReactMarkdown>
                                      {answerFeedback[q.id][0]}
                                    </ReactMarkdown>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Calendar, FileText, TrendingDown, Loader2, Trash2 } from "lucide-react";
import { createExam, getExams, getDiagnosis, deleteExam } from "@/lib/api";
import { SUBJECTS } from "@/lib/subjects";
import SubjectBadge from "@/components/SubjectBadge";
import type { Exam, ExamCreate, Diagnosis } from "@/types";

// Map subject id to the score field name on Exam
const SCORE_FIELDS: Record<string, keyof Exam> = {
  chinese: "chinese_score",
  math: "math_score",
  english: "english_score",
  physics: "physics_score",
  chemistry: "chemistry_score",
  politics: "politics_score",
};

export default function ExamPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [scores, setScores] = useState<Record<string, number>>({
    chinese: 0,
    math: 0,
    english: 0,
    physics: 0,
    chemistry: 0,
    politics: 0,
  });

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    try {
      const data = await getExams();
      setExams(data);
    } catch {
      // No exams yet
    } finally {
      setLoading(false);
    }
  }

  function updateScore(subject: string, value: string) {
    const num = parseInt(value) || 0;
    setScores((prev) => ({ ...prev, [subject]: num }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!examName.trim()) {
      setError("请输入考试名称");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payload: ExamCreate = {
        exam_name: examName,
        exam_date: examDate,
        chinese_score: scores.chinese,
        math_score: scores.math,
        english_score: scores.english,
        physics_score: scores.physics,
        chemistry_score: scores.chemistry,
        politics_score: scores.politics,
      };
      const exam = await createExam(payload);
      setExams((prev) => [exam, ...prev]);
      setExamName("");
      setScores({
        chinese: 0,
        math: 0,
        english: 0,
        physics: 0,
        chemistry: 0,
        politics: 0,
      });

      // Load diagnosis
      try {
        const diag = await getDiagnosis();
        if (!diag.error) {
          setDiagnosis(diag);
          setShowDiagnosis(true);
        }
      } catch {
        // Diagnosis may not be available
      }
    } catch (err: any) {
      setError(err.message || "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteExam(id: string) {
    if (!window.confirm("确定要删除这条考试记录吗？")) return;
    try {
      await deleteExam(id);
      setExams((prev) => prev.filter((e) => e.id !== id));
    } catch {
      // Ignore
    }
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          成绩录入
        </h1>
        <p className="text-slate-500 mt-1">记录考试成绩，获取智能诊断</p>
      </div>

      {/* Score Input Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-card rounded-3xl p-5 lg:p-8 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <FileText size={14} className="inline mr-1" />
              考试名称
            </label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="例：月考一"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Calendar size={14} className="inline mr-1" />
              考试日期
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-sm"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">各科成绩</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SUBJECTS.map((subject) => (
              <div key={subject.id} className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm text-slate-600">
                  <span>{subject.icon}</span>
                  <span>{subject.name}</span>
                  <span className="text-xs text-slate-400">
                    (目标{subject.target})
                  </span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={150}
                  value={scores[subject.id] || ""}
                  onChange={(e) => updateScore(subject.id, e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-sm text-center text-lg font-semibold"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-center sm:text-left">
            <p className="text-sm text-slate-500">总分</p>
            <p className="text-3xl font-bold text-slate-900">{totalScore}</p>
          </div>
          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {submitting ? "提交中..." : "提交成绩"}
          </button>
        </div>
      </motion.form>

      {/* Diagnosis Result */}
      <AnimatePresence>
        {showDiagnosis && diagnosis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card rounded-3xl p-5 lg:p-8 border-l-4 border-indigo-500"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingDown size={20} className="text-indigo-600" />
              成绩诊断
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-sm text-slate-500">当前总分</p>
                <p className="text-2xl font-bold text-slate-900">
                  {diagnosis.total_current}
                </p>
              </div>
              <div className="bg-indigo-50 rounded-2xl p-4">
                <p className="text-sm text-indigo-500">目标总分</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {diagnosis.total_target}
                </p>
              </div>
              <div className="bg-rose-50 rounded-2xl p-4">
                <p className="text-sm text-rose-500">差距</p>
                <p className="text-2xl font-bold text-rose-600">
                  -{diagnosis.total_gap}
                </p>
              </div>
            </div>

            {diagnosis.subject_gaps?.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-600">
                  各科差距分析（按优先级排序）
                </p>
                {diagnosis.subject_gaps
                  .sort((a, b) => a.priority_rank - b.priority_rank)
                  .map((sg) => (
                    <div
                      key={sg.subject}
                      className="bg-slate-50 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <SubjectBadge subject={sg.subject} size="sm" />
                        <span className="text-sm text-slate-600">
                          {sg.current} / {sg.target}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                          优先级 #{sg.priority_rank}
                        </span>
                        <span className="text-sm font-semibold text-rose-600">
                          差{sg.gap}分
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exam History */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">历史成绩</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loader" />
          </div>
        ) : exams.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 text-center">
            <p className="text-slate-400">暂无考试记录</p>
            <p className="text-sm text-slate-300 mt-1">
              录入你的第一次考试成绩吧
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {exams.map((exam, i) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {exam.exam_name}
                    </h3>
                    <p className="text-xs text-slate-400">{exam.exam_date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">
                        {exam.total_score}
                      </p>
                      <p className="text-xs text-slate-400">总分</p>
                    </div>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition"
                      title="删除"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => {
                    const scoreField = SCORE_FIELDS[s.id];
                    const score = (exam[scoreField] as number) || 0;
                    return (
                      <span
                        key={s.id}
                        className="text-xs bg-slate-50 px-2 py-1 rounded-lg text-slate-600"
                      >
                        {s.icon} {score}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

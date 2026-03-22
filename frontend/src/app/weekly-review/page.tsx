"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  BookOpen,
  Sparkles,
  Loader2,
  TrendingUp,
  Clock,
} from "lucide-react";
import { getWeeklyReview } from "@/lib/api";
import { SUBJECTS, getSubjectName } from "@/lib/subjects";
import SubjectBadge from "@/components/SubjectBadge";
import type { WeeklyReview } from "@/types";

export default function WeeklyReviewPage() {
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReview();
  }, []);

  async function loadReview() {
    try {
      const data = await getWeeklyReview();
      setReview(data);
    } catch {
      // No review yet
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loader" />
      </div>
    );
  }

  // Convert subject_breakdown dict to array for rendering
  const subjectEntries = review
    ? Object.entries(review.subject_breakdown).map(([key, val]) => ({
        subject: key,
        ...val,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            周总结
          </h1>
          <p className="text-slate-500 mt-1">回顾本周学习，规划下周方向</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {!review ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <BarChart3 size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">暂无周总结</p>
          <p className="text-slate-400 text-sm mt-1">
            完成一些学习任务后即可查看周总结
          </p>
        </div>
      ) : (
        <>
          {/* Week Info */}
          <div className="glass-card rounded-3xl p-5 lg:p-8 bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold">
                  周总结
                </h2>
                <p className="text-indigo-100 text-sm">
                  {review.week_start} ~ {review.week_end}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/10 rounded-2xl p-3 text-center">
                <CheckCircle2 size={20} className="mx-auto mb-1 opacity-80" />
                <p className="text-2xl font-bold">{review.completed_tasks}</p>
                <p className="text-xs opacity-70">已完成</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 text-center">
                <XCircle size={20} className="mx-auto mb-1 opacity-80" />
                <p className="text-2xl font-bold">
                  {review.total_tasks - review.completed_tasks}
                </p>
                <p className="text-xs opacity-70">未完成</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 text-center">
                <TrendingUp size={20} className="mx-auto mb-1 opacity-80" />
                <p className="text-2xl font-bold">
                  {Math.round(review.completion_rate)}%
                </p>
                <p className="text-xs opacity-70">完成率</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 text-center">
                <BookOpen size={20} className="mx-auto mb-1 opacity-80" />
                <p className="text-2xl font-bold">
                  {review.wrong_questions_mastered}
                </p>
                <p className="text-xs opacity-70">错题掌握</p>
              </div>
            </div>
          </div>

          {/* Wrong Question Progress */}
          <div className="glass-card rounded-3xl p-5 lg:p-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-rose-500" />
              错题复习进度
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600">
                    已复习 {review.wrong_questions_reviewed} 题
                  </span>
                  <span className="text-emerald-600 font-medium">
                    掌握 {review.wrong_questions_mastered} 题
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-400 to-emerald-400 rounded-full transition-all"
                    style={{
                      width: `${
                        review.wrong_questions_reviewed > 0
                          ? (review.wrong_questions_mastered /
                              review.wrong_questions_reviewed) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subject Progress */}
          {subjectEntries.length > 0 && (
            <div className="glass-card rounded-3xl p-5 lg:p-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-500" />
                各科学习进度
              </h2>
              <div className="space-y-4">
                {subjectEntries.map((sp) => {
                  const progress =
                    sp.total > 0
                      ? Math.round((sp.completed / sp.total) * 100)
                      : 0;
                  const config = SUBJECTS.find((s) => s.id === sp.subject);
                  const totalHours = Math.round(sp.total_minutes / 60 * 10) / 10;
                  return (
                    <div key={sp.subject}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span>{config?.icon}</span>
                          <span className="text-sm font-medium text-slate-700">
                            {sp.subject_cn || config?.name || sp.subject}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {totalHours}小时
                          </span>
                          <span>
                            {sp.completed}/{sp.total} 任务
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                          className="h-full bg-indigo-500 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Summary */}
          {review.ai_summary && (
            <div className="glass-card rounded-3xl p-5 lg:p-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">
                本周总结
              </h2>
              <div className="markdown-body text-sm bg-slate-50 rounded-2xl p-4">
                <ReactMarkdown>{review.ai_summary}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {review.suggestions && review.suggestions.length > 0 && (
            <div className="glass-card rounded-3xl p-5 lg:p-8 border-l-4 border-indigo-500">
              <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-500" />
                下周建议
              </h2>
              <ul className="space-y-2">
                {review.suggestions.map((suggestion, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

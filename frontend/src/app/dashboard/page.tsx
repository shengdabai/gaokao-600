"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Target,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  ClipboardEdit,
  BrainCircuit,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import ScoreCard from "@/components/ScoreCard";
import { getUserProfile, getDiagnosis, getDailyTasks, getWrongQuestions } from "@/lib/api";
import { SUBJECTS, TOTAL_TARGET } from "@/lib/subjects";
import type { Diagnosis, DailyTask } from "@/types";

interface DashboardState {
  diagnosis: Diagnosis | null;
  todayTasks: DailyTask[];
  pendingReviews: number;
  loading: boolean;
  error: string | null;
}

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>({
    diagnosis: null,
    todayTasks: [],
    pendingReviews: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Call individual endpoints in parallel
      const [diagResult, tasksResult, wrongQResult] = await Promise.allSettled([
        getDiagnosis(),
        getDailyTasks(today),
        getWrongQuestions(),
      ]);

      const diag =
        diagResult.status === "fulfilled" && !diagResult.value.error
          ? diagResult.value
          : null;
      const tasks =
        tasksResult.status === "fulfilled" ? tasksResult.value : [];
      const wrongQuestions =
        wrongQResult.status === "fulfilled" ? wrongQResult.value : [];

      const pendingReviews = wrongQuestions.filter(
        (q) => q.mastery_status !== "mastered"
      ).length;

      setState({
        diagnosis: diag,
        todayTasks: tasks,
        pendingReviews,
        loading: false,
        error: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "暂无数据，请先录入成绩",
      }));
    }
  }

  const totalScore = state.diagnosis?.total_current || 0;
  const gap = state.diagnosis?.total_gap || (TOTAL_TARGET - totalScore);
  const progress = Math.min((totalScore / TOTAL_TARGET) * 100, 100);
  const completedTasks = state.todayTasks.filter((t) => t.completed).length;

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          学习仪表盘
        </h1>
        <p className="text-slate-500 mt-1">追踪进度，迈向600分目标</p>
      </div>

      {/* Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 lg:p-8 bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-indigo-100 text-sm font-medium">当前总分</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-5xl lg:text-6xl font-extrabold">
                {totalScore || "---"}
              </span>
              <span className="text-xl text-indigo-200 mb-2">/ {TOTAL_TARGET}</span>
            </div>
            {totalScore > 0 && (
              <p className="text-indigo-100 mt-2 text-sm">
                距离目标还差 <span className="font-bold text-white">{gap}</span>{" "}
                分
              </p>
            )}
          </div>
          <div className="w-full sm:w-48">
            <div className="relative">
              <svg className="w-32 h-32 mx-auto" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="white"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(progress / 100) * 327} 327`}
                  transform="rotate(-90 60 60)"
                  className="transition-all duration-1000"
                />
                <text
                  x="60"
                  y="55"
                  textAnchor="middle"
                  className="fill-white text-xl font-bold"
                  fontSize="20"
                >
                  {totalScore > 0 ? `${Math.round(progress)}%` : "--"}
                </text>
                <text
                  x="60"
                  y="72"
                  textAnchor="middle"
                  className="fill-indigo-200"
                  fontSize="10"
                >
                  完成率
                </text>
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <CheckCircle2 size={16} />
            <span className="text-xs font-medium">今日任务</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {completedTasks}
            <span className="text-sm text-slate-400 font-normal">
              /{state.todayTasks.length}
            </span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <AlertCircle size={16} />
            <span className="text-xs font-medium">待复习错题</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {state.pendingReviews}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Target size={16} />
            <span className="text-xs font-medium">距离目标</span>
          </div>
          <p className="text-2xl font-bold text-rose-600">
            {totalScore > 0 ? `-${gap}` : "--"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <TrendingUp size={16} />
            <span className="text-xs font-medium">完成率</span>
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {totalScore > 0 ? `${Math.round(progress)}%` : "--"}
          </p>
        </motion.div>
      </div>

      {/* Subject Scores from Diagnosis */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">各科目标差距</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {SUBJECTS.map((subject, i) => {
            const subjectGap = state.diagnosis?.subject_gaps?.find(
              (sg) => sg.subject === subject.id
            );
            const current = subjectGap?.current || 0;
            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <ScoreCard
                  subject={subject.id}
                  current={current}
                  target={subject.target}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/exam"
            className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:shadow-lg transition-shadow group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <ClipboardEdit size={20} className="text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">录入成绩</p>
              <p className="text-xs text-slate-400">记录最新考试分数</p>
            </div>
            <ArrowRight
              size={16}
              className="text-slate-300 group-hover:text-indigo-500 transition-colors"
            />
          </Link>
          <Link
            href="/wrong-questions"
            className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:shadow-lg transition-shadow group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <BookOpen size={20} className="text-rose-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">整理错题</p>
              <p className="text-xs text-slate-400">添加和复习错题</p>
            </div>
            <ArrowRight
              size={16}
              className="text-slate-300 group-hover:text-rose-500 transition-colors"
            />
          </Link>
          <Link
            href="/ai-review"
            className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:shadow-lg transition-shadow group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <BrainCircuit size={20} className="text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">AI批改</p>
              <p className="text-xs text-slate-400">智能作文和政治批改</p>
            </div>
            <ArrowRight
              size={16}
              className="text-slate-300 group-hover:text-violet-500 transition-colors"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

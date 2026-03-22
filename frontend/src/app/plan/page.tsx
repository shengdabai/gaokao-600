"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  CalendarDays,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  Trash2,
} from "lucide-react";
import { getWeeklyPlan, generatePlan, getDailyTasks, completeTask, deleteTask } from "@/lib/api";
import { getSubjectName, SUBJECTS } from "@/lib/subjects";
import TaskCard from "@/components/TaskCard";
import SubjectBadge from "@/components/SubjectBadge";
import type { Plan, DailyTask } from "@/types";

interface PlanPhase {
  phase_number: number;
  name: string;
  description: string;
  start_day: number;
  end_day: number;
  focus: string[];
}

export default function PlanPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [phases, setPhases] = useState<PlanPhase[]>([]);
  const [todayTasks, setTodayTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlan();
  }, []);

  async function loadPlan() {
    try {
      const [weeklyPlan, tasks] = await Promise.allSettled([
        getWeeklyPlan(),
        getDailyTasks(new Date().toISOString().split("T")[0]),
      ]);

      if (weeklyPlan.status === "fulfilled") {
        const p = weeklyPlan.value;
        setPlan(p);
        // Parse content JSON string for phases if available
        try {
          const parsed = JSON.parse(p.content);
          if (Array.isArray(parsed)) {
            setPhases(parsed);
          } else if (parsed.phases) {
            setPhases(parsed.phases);
          }
        } catch {
          // content might not be parseable
        }
      }

      if (tasks.status === "fulfilled") {
        setTodayTasks(tasks.value);
      }
    } catch {
      // No plan yet
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const data = await generatePlan();
      setPlan(data);
      // Parse content
      try {
        const parsed = JSON.parse(data.content);
        if (Array.isArray(parsed)) {
          setPhases(parsed);
        } else if (parsed.phases) {
          setPhases(parsed.phases);
        }
      } catch {
        // content might not be parseable
      }
      // Reload today's tasks
      try {
        const tasks = await getDailyTasks(
          new Date().toISOString().split("T")[0]
        );
        setTodayTasks(tasks);
      } catch {
        // Tasks may not be available yet
      }
    } catch (err: any) {
      setError(err.message || "生成失败，请先录入成绩并获取诊断");
    } finally {
      setGenerating(false);
    }
  }

  async function handleToggleTask(taskId: string, completed: boolean) {
    if (!completed) return; // Backend only supports completing
    try {
      await completeTask(taskId);
      setTodayTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
      );
    } catch {
      // Revert on error
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!window.confirm("确定要删除这个任务吗？")) return;
    try {
      await deleteTask(taskId);
      setTodayTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch {
      // Ignore
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loader" />
      </div>
    );
  }

  const completedCount = todayTasks.filter((t) => t.completed).length;
  const taskProgress =
    todayTasks.length > 0
      ? Math.round((completedCount / todayTasks.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            学习计划
          </h1>
          <p className="text-slate-500 mt-1">百日冲刺600分学习规划</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {generating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          {generating ? "生成中..." : "生成计划"}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {!plan ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <CalendarDays size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">暂无学习计划</p>
          <p className="text-slate-400 text-sm mt-1">
            请先录入成绩，然后点击「生成计划」
          </p>
        </div>
      ) : (
        <>
          {/* Plan Info */}
          <div className="glass-card rounded-3xl p-5 lg:p-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              {plan.title}
            </h2>
            <p className="text-sm text-slate-500">
              {plan.start_date} ~ {plan.end_date} | 状态: {plan.status}
            </p>
          </div>

          {/* Phase Overview */}
          {phases.length > 0 && (
            <div className="glass-card rounded-3xl p-5 lg:p-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Target size={20} className="text-indigo-600" />
                三阶段规划
              </h2>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-indigo-100 hidden sm:block" />
                <div className="space-y-4">
                  {phases.map((phase, i) => (
                    <motion.div
                      key={phase.phase_number}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 items-start"
                    >
                      <div className="hidden sm:flex flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white items-center justify-center text-sm font-bold z-10">
                        {phase.phase_number}
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="sm:hidden inline-flex w-6 h-6 rounded-full bg-indigo-600 text-white items-center justify-center text-xs font-bold">
                            {phase.phase_number}
                          </span>
                          <h3 className="font-semibold text-slate-800">
                            {phase.name}
                          </h3>
                          <span className="text-xs text-slate-400">
                            第{phase.start_day}-{phase.end_day}天
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {phase.description}
                        </p>
                        {phase.focus && phase.focus.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {phase.focus.map((f) => (
                              <SubjectBadge key={f} subject={f} size="sm" />
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Today's Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                今日任务
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">
                  {completedCount}/{todayTasks.length}
                </span>
                <div className="w-20 h-1.5 bg-slate-100 rounded-full">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${taskProgress}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {todayTasks.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <p className="text-sm text-slate-400">今日暂无任务</p>
                </div>
              ) : (
                todayTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-2">
                    <div className="flex-1">
                      <TaskCard
                        id={task.id}
                        subject={task.subject}
                        description={task.title + (task.description ? ` - ${task.description}` : "")}
                        durationMinutes={task.estimated_minutes}
                        completed={task.completed}
                        onToggle={handleToggleTask}
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="mt-3 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition"
                      title="删除任务"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

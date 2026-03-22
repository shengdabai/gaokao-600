"use client";

import { SUBJECTS } from "@/lib/subjects";

interface ScoreCardProps {
  subject: string;
  current: number;
  target?: number;
}

const bgColorMap: Record<string, string> = {
  emerald: "from-emerald-500 to-emerald-600",
  indigo: "from-indigo-500 to-indigo-600",
  teal: "from-teal-500 to-teal-600",
  blue: "from-blue-500 to-blue-600",
  violet: "from-violet-500 to-violet-600",
  rose: "from-rose-500 to-rose-600",
};

const barBgMap: Record<string, string> = {
  emerald: "bg-emerald-500",
  indigo: "bg-indigo-500",
  teal: "bg-teal-500",
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
};

export default function ScoreCard({ subject, current, target }: ScoreCardProps) {
  const config = SUBJECTS.find((s) => s.id === subject);
  if (!config) return null;

  const subjectTarget = target ?? config.target;
  const gap = subjectTarget - current;
  const progress = Math.min((current / subjectTarget) * 100, 100);

  return (
    <div className="glass-card rounded-3xl p-5 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <span className="font-semibold text-slate-800">{config.name}</span>
        </div>
        {gap > 0 ? (
          <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
            差{gap}分
          </span>
        ) : (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            已达标
          </span>
        )}
      </div>
      <div className="flex items-end gap-1 mb-2">
        <span className="text-3xl font-bold text-slate-900">{current}</span>
        <span className="text-sm text-slate-400 mb-1">/ {subjectTarget}</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barBgMap[config.color] || "bg-indigo-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

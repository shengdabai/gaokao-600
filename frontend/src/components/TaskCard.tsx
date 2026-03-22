"use client";

import { Check, Clock } from "lucide-react";
import SubjectBadge from "./SubjectBadge";

interface TaskCardProps {
  id: string;
  subject: string;
  description: string;
  durationMinutes: number;
  completed: boolean;
  onToggle: (id: string, completed: boolean) => void;
}

export default function TaskCard({
  id,
  subject,
  description,
  durationMinutes,
  completed,
  onToggle,
}: TaskCardProps) {
  return (
    <div
      className={`glass-card rounded-2xl p-4 flex items-start gap-3 transition-all ${
        completed ? "opacity-60" : ""
      }`}
    >
      <button
        onClick={() => onToggle(id, !completed)}
        className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          completed
            ? "bg-indigo-600 border-indigo-600 text-white"
            : "border-slate-300 hover:border-indigo-400"
        }`}
      >
        {completed && <Check size={14} />}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            completed ? "line-through text-slate-400" : "text-slate-800"
          }`}
        >
          {description}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <SubjectBadge subject={subject} size="sm" />
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Clock size={12} />
            {durationMinutes}分钟
          </span>
        </div>
      </div>
    </div>
  );
}

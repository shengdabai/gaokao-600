"use client";

import { SUBJECTS } from "@/lib/subjects";

interface SubjectBadgeProps {
  subject: string;
  size?: "sm" | "md" | "lg";
}

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
  teal: "bg-teal-100 text-teal-700 border-teal-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  violet: "bg-violet-100 text-violet-700 border-violet-200",
  rose: "bg-rose-100 text-rose-700 border-rose-200",
};

const sizeMap = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export default function SubjectBadge({ subject, size = "md" }: SubjectBadgeProps) {
  const config = SUBJECTS.find((s) => s.id === subject);
  if (!config) return <span className="text-sm text-slate-500">{subject}</span>;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${colorMap[config.color] || ""} ${sizeMap[size]}`}
    >
      <span>{config.icon}</span>
      <span>{config.name}</span>
    </span>
  );
}

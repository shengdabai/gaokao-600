import type { SubjectConfig } from "@/types";

export const SUBJECTS: SubjectConfig[] = [
  { id: "chinese", name: "语文", icon: "📖", color: "emerald", target: 110 },
  { id: "math", name: "数学", icon: "📐", color: "indigo", target: 120 },
  { id: "english", name: "英语", icon: "🔤", color: "teal", target: 110 },
  { id: "physics", name: "物理", icon: "⚡", color: "blue", target: 85 },
  { id: "chemistry", name: "化学", icon: "🧪", color: "violet", target: 80 },
  { id: "politics", name: "政治", icon: "⚖️", color: "rose", target: 85 },
];

export const TOTAL_TARGET = 600;

export function getSubject(id: string) {
  return SUBJECTS.find((s) => s.id === id);
}

export function getSubjectName(id: string) {
  return getSubject(id)?.name || id;
}

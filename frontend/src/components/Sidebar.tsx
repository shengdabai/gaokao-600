"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardEdit,
  CalendarDays,
  BookX,
  BrainCircuit,
  BarChart3,
  GraduationCap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { href: "/exam", label: "成绩录入", icon: ClipboardEdit },
  { href: "/plan", label: "学习计划", icon: CalendarDays },
  { href: "/wrong-questions", label: "错题本", icon: BookX },
  { href: "/ai-review", label: "AI批改", icon: BrainCircuit },
  { href: "/weekly-review", label: "周总结", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 z-40">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <GraduationCap className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">高考冲刺</h1>
            <p className="text-xs text-slate-400">百日600分计划</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <div className="glass-card rounded-2xl p-4 bg-gradient-to-br from-indigo-50 to-violet-50">
          <p className="text-xs font-medium text-indigo-700">目标分数</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">600</p>
          <p className="text-xs text-slate-500 mt-1">百日冲刺，金榜题名</p>
        </div>
      </div>
    </aside>
  );
}

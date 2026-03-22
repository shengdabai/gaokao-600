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
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { href: "/exam", label: "成绩", icon: ClipboardEdit },
  { href: "/plan", label: "计划", icon: CalendarDays },
  { href: "/wrong-questions", label: "错题", icon: BookX },
  { href: "/ai-review", label: "AI批改", icon: BrainCircuit },
  { href: "/weekly-review", label: "周结", icon: BarChart3 },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[3rem] transition-colors ${
                isActive
                  ? "text-indigo-600"
                  : "text-slate-400 active:text-slate-600"
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

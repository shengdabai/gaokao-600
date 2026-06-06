# 🎯 高考冲刺 600 分

> 面向高三学生的 AI 网页学习伴侣：智能作文批改 · 错题间隔重复 · 个性化学习计划。

[![Last Commit](https://img.shields.io/github/last-commit/shengdabai/gaokao-600)](https://github.com/shengdabai/gaokao-600/commits)
[![Stars](https://img.shields.io/github/stars/shengdabai/gaokao-600?style=social)](https://github.com/shengdabai/gaokao-600/stargazers)
[![Follow @shengdabai](https://img.shields.io/github/followers/shengdabai?style=social)](https://github.com/shengdabai)

把"提分"这件事拆成每天可执行的小任务——成绩诊断找差距，百日计划定节奏，错题本按记忆曲线复习，AI 帮你批改作文、讲解错题。专为冲刺 600 分的高三学生打造。

## 为什么做这个

高三最缺的不是题，而是**方向**和**反馈**。

- 不知道该补哪科、补到什么程度——靠**成绩诊断**按权重排优先级；
- 复习没节奏、容易遗忘——靠**间隔重复**把错题在 1/2/4/7/15 天反复推到你面前；
- 作文、答题没人批、没人讲——靠 **AI 批改**即时给结构分析和解题思路。

让每一天的努力都落在刀刃上。

## 做什么

输入各科成绩 → 自动算出与目标分的差距并排好优先级 → 生成百日三阶段计划与每周/每日任务 → 错题入库后按记忆曲线自动安排复习 → 作文与答题交给 AI 批改、错题拍照让 AI 讲解 → 每周自动统计完成率并给出下周建议。一个网页端，手机也能直接打开用。

## ✨ 功能特性

- **成绩诊断** — 录入各科成绩，自动计算与目标分的差距，按科目权重排定提分优先级。
- **百日计划** — 三阶段规划（基础修复 → 巩固提升 → 冲刺模拟），自动生成每周与每日任务。
- **错题本（间隔重复）** — 按 1/2/4/7/15 天的记忆曲线自动安排复习，支持按科目 / 知识点筛选。
- **AI 作文批改** — 语文作文结构分析、政治主观题评分，即时给出反馈。
- **拍照讲解** — 上传题目图片，AI 解析解题思路。
- **笔记速查** — 按知识点快速调取核心笔记。
- **每周复盘** — 自动统计完成率，给出下一周的学习建议。

## 🧱 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Next.js 15 · TypeScript · Tailwind CSS v4 · React 19 |
| 后端 | FastAPI · Python 3.11+ |
| 数据库 | SQLite |
| AI | Google Gemini（gemini-2.5-flash） |

## 🚀 快速开始

### 后端

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 配置环境变量
cp ../.env.example .env
# 在 .env 中填入你的 GEMINI_API_KEY
# 获取密钥：https://aistudio.google.com/apikey

uvicorn app.main:app --reload --port 8000
```

### 前端

```bash
cd frontend
npm install
npm run dev
# 打开 http://localhost:3000
```

### 环境变量

| 变量 | 说明 |
|------|------|
| `GEMINI_API_KEY` | Google Gemini API 密钥（[在此获取](https://aistudio.google.com/apikey)） |
| `NEXT_PUBLIC_API_URL` | 前端调用的后端地址（默认 `http://localhost:8000`） |

只需配置 `GEMINI_API_KEY` 即可开启全部 AI 功能。

## 📖 使用说明

1. 在**仪表盘**录入各科成绩，查看与目标分的差距与提分优先级。
2. 生成**百日计划**，按每周 / 每日任务执行。
3. 把做错的题加入**错题本**，系统会按记忆曲线在该复习时提醒你。
4. 写完作文 / 主观题，用 **AI 批改**拿即时反馈；遇到不会的题，拍照让 **AI 讲解**。
5. 每周看一次**复盘**，根据完成率调整下周节奏。

> 界面针对手机浏览器做了响应式优化，部署后用手机直接打开前端地址即可使用。

## 🗺️ 项目状态

功能可用，持续打磨中。当前覆盖成绩诊断、百日计划、错题间隔重复、AI 批改、拍照讲解、笔记速查与每周复盘七大模块。欢迎提 Issue 反馈使用体验与需求。

### 部署

- **前端 — Vercel**：导入仓库，根目录设为 `frontend`，配置 `NEXT_PUBLIC_API_URL`。
- **后端 — Railway / Render / Docker**：仓库内已含 `Dockerfile`、`railway.json` 与 `Procfile`，可直接部署。

## 🤝 关于与连接

作者 **Tony（盛）** 是一名中文培训师，累计服务 6000+ 学员，长期用 AI 打造中文教学与备考工具。这个项目是其中之一——把一线教学经验沉淀成学生每天都能用上的提分工具。

如果它对你或你的学生有帮助，欢迎 ⭐ **[Star 本仓库](https://github.com/shengdabai/gaokao-600)** 并关注 **[@shengdabai](https://github.com/shengdabai)**，这是对作者持续投入最大的鼓励。

**相关项目**

- [gaokao-study-materials](https://github.com/shengdabai/gaokao-study-materials) — 高考备考资料
- [gaokao-review](https://github.com/shengdabai/gaokao-review) — 高考复习工具
- [gaokao-assistant](https://github.com/shengdabai/gaokao-assistant) — 高考备考助手

## License

暂无开源协议（All rights reserved）。

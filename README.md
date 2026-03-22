# 高考冲刺 600 分 · 百日逆袭计划

面向高三住校生的个人学习助手 Web 应用，支持成绩诊断、智能排课、错题间隔复习和 AI 批改。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 15 · TypeScript · Tailwind CSS v4 |
| 后端 | FastAPI · Python 3.11+ |
| 数据库 | SQLite |
| AI | Google Gemini (gemini-2.5-flash) |

## 功能

- **成绩诊断** — 录入各科分数，自动计算差距并按权重排序优先科目
- **百日计划** — 三阶段（基础修复→中等稳固→冲刺模拟）自动生成周/日任务
- **错题本** — 间隔重复复习（1/2/4/7/15 天），按科目/知识点筛选
- **AI 批改** — 语文作文结构分析、政治主观题评分
- **拍题讲解** — 上传题目图片，AI 解析解题思路
- **笔记搜索** — 按知识点快速获取核心笔记
- **周总结** — 自动统计完成率，生成下周建议

## 本地运行

### 后端

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 配置环境变量
cp ../.env.example .env
# 编辑 .env 填入你的 GEMINI_API_KEY
# 获取地址: https://aistudio.google.com/apikey

# 启动
uvicorn app.main:app --reload --port 8000
```

### 前端

```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:3000
```

## 环境变量

| 变量 | 说明 |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API 密钥（[获取地址](https://aistudio.google.com/apikey)） |

只需配置这一个环境变量即可启用全部 AI 功能（语文批改、政治批改、拍题讲解、笔记搜索、周总结）。

## 部署

### 前端 → Vercel

1. 推送到 GitHub
2. 在 Vercel 导入仓库，设置根目录为 `frontend`
3. 添加环境变量 `NEXT_PUBLIC_API_URL` 指向后端地址

### 后端 → Railway / Render / Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/ .
RUN pip install -r requirements.txt
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

部署后需在后端 CORS 中添加前端域名。

## 手机访问

部署完成后，在手机浏览器直接访问前端 URL 即可。响应式设计已针对手机屏幕优化。

## 项目结构

```
gaokao-600/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI 入口
│   │   ├── database.py      # SQLite 配置
│   │   ├── models/          # SQLAlchemy 模型
│   │   ├── schemas/         # Pydantic 模型
│   │   ├── routes/          # API 路由
│   │   └── services/        # 业务逻辑
│   ├── uploads/             # 文件上传目录
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js 页面
│   │   ├── components/      # 共享组件
│   │   ├── lib/             # API 客户端
│   │   └── types/           # TypeScript 类型
│   └── package.json
├── .env.example
└── README.md
```

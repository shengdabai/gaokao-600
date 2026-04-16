# Gaokao Sprint 600

A web-based study companion for high school students aiming for 600+ on the Gaokao (Chinese college entrance exam). Features AI-powered essay grading, spaced repetition, and smart study planning.

高考冲刺 600 分 -- 面向高三住校生的 AI 学习助手，支持成绩诊断、智能排课、错题间隔复习和 AI 批改。

## Features / 功能特性

- **Score Diagnosis** -- Input subject scores, auto-calculate gaps and prioritize subjects by weight
- **100-Day Plan** -- Three-phase plan (foundation repair, consolidation, sprint simulation) with auto-generated weekly/daily tasks
- **Mistake Book** -- Spaced repetition review (1/2/4/7/15 days) with subject/topic filtering
- **AI Grading** -- Chinese essay structure analysis, politics essay scoring
- **Photo Explanation** -- Upload problem images, AI explains solution approach
- **Note Search** -- Quick access to core notes by topic
- **Weekly Summary** -- Auto-completion rate statistics with next-week suggestions

## Tech Stack / 技术栈

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS v4 |
| Backend | FastAPI, Python 3.11+ |
| Database | SQLite |
| AI | Google Gemini (gemini-2.5-flash) |

## Project Structure / 项目结构

```
gaokao-600/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry
│   │   ├── database.py      # SQLite config
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── routes/          # API routes
│   │   └── services/        # Business logic
│   ├── uploads/             # File uploads
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # Shared components
│   │   ├── lib/             # API client
│   │   └── types/           # TypeScript types
│   └── package.json
└── .env.example
```

## Getting Started / 快速开始

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env
# Edit .env with your GEMINI_API_KEY
# Get key: https://aistudio.google.com/apikey

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

## Environment Variables / 环境变量

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key ([Get here](https://aistudio.google.com/apikey)) |

Only this one environment variable is needed to enable all AI features.

## Deployment / 部署

**Frontend -- Vercel**: Import repo, set root directory to `frontend`, add `NEXT_PUBLIC_API_URL`.

**Backend -- Railway/Render/Docker**:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/ .
RUN pip install -r requirements.txt
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Mobile / 手机访问

Responsive design optimized for mobile browsers. Access the frontend URL directly after deployment.

## License

Private repository. All rights reserved.

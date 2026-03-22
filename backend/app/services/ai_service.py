from __future__ import annotations

import asyncio
import base64
import json
import os

from google import genai
from google.genai import types


def _get_client() -> genai.Client:
    api_key = os.environ.get("GEMINI_API_KEY", "")
    return genai.Client(api_key=api_key)


MODEL = "gemini-2.5-flash-preview-05-20"


def _generate(contents: list, temperature: float = 0.7) -> str:
    """Synchronous wrapper around the Gemini API."""
    client = _get_client()
    response = client.models.generate_content(
        model=MODEL,
        contents=contents,
        config=types.GenerateContentConfig(temperature=temperature),
    )
    return response.text


class AIService:
    @staticmethod
    async def chinese_review(text: str) -> str:
        system_prompt = (
            "你是一位经验丰富的高中语文老师，擅长高考作文指导。"
            "请对学生提交的作文或文段进行详细点评，包括以下维度：\n"
            "1. **结构清晰度**：文章结构是否完整、层次是否分明\n"
            "2. **论证完整性**：论点是否明确、论据是否充分、论证过程是否严密\n"
            "3. **语言表达**：是否存在模糊表达、用词是否准确生动\n"
            "4. **素材运用**：建议补充的论据或素材\n"
            "5. **修改建议**：具体的修改方向和改进方案\n\n"
            "请用鼓励性的语气，先肯定优点，再指出不足。"
        )
        prompt = f"{system_prompt}\n\n请点评以下作文/文段：\n\n{text}"
        return await asyncio.to_thread(_generate, [prompt])

    @staticmethod
    async def politics_review(question: str, answer: str) -> str:
        system_prompt = (
            "你是一位经验丰富的高中政治老师，擅长高考政治大题答题指导。"
            "请对学生的政治答案进行详细评析，包括以下维度：\n"
            "1. **审题准确性**：是否准确理解题目要求，有无答非所问\n"
            "2. **要点完整性**：是否遗漏重要得分点，列出缺失的要点\n"
            "3. **术语规范性**：政治术语使用是否准确规范\n"
            "4. **逻辑结构**：答案组织是否条理清晰，是否符合「原理+材料分析」的答题模式\n"
            "5. **改进建议**：给出具体的优化方案和参考答案框架\n\n"
            "请用鼓励性的语气点评。"
        )
        prompt = (
            f"{system_prompt}\n\n"
            f"题目：{question}\n\n学生答案：{answer}\n\n请给出详细评析。"
        )
        return await asyncio.to_thread(_generate, [prompt])

    @staticmethod
    async def weekly_summary(data: dict) -> str:
        system_prompt = (
            "你是一位高考备考规划师，请根据学生本周的学习数据生成一份温暖、"
            "有建设性的周总结报告。语气要积极鼓励，同时提出具体可行的改进建议。"
        )
        user_content = (
            f"本周学习数据：\n"
            f"- 任务完成：{data.get('completed_tasks', 0)}/{data.get('total_tasks', 0)}\n"
            f"- 完成率：{data.get('completion_rate', 0)}%\n"
            f"- 错题复习：{data.get('wrong_questions_reviewed', 0)}道\n"
            f"- 错题掌握：{data.get('wrong_questions_mastered', 0)}道\n"
            f"- 各科情况：{json.dumps(data.get('subject_breakdown', {}), ensure_ascii=False)}\n"
            f"- 系统建议：{json.dumps(data.get('suggestions', []), ensure_ascii=False)}\n\n"
            f"请生成一份周总结报告，包含：本周亮点、需改进之处、下周建议。"
        )
        prompt = f"{system_prompt}\n\n{user_content}"
        return await asyncio.to_thread(_generate, [prompt])

    @staticmethod
    async def analyze_image(base64_image: str, subject: str = "general") -> str:
        subject_cn = {
            "chinese": "语文",
            "math": "数学",
            "english": "英语",
            "physics": "物理",
            "chemistry": "化学",
            "politics": "政治",
        }.get(subject, "综合")

        system_prompt = (
            f"你是一位{subject_cn}学科的高中老师。"
            "请分析图片中的题目，给出详细的解题思路和答案。"
            "如果题目涉及计算，请写出完整的解题步骤。"
        )

        # Determine media type from base64 header or default to png
        mime_type = "image/png"
        if base64_image.startswith("/9j/"):
            mime_type = "image/jpeg"

        image_bytes = base64.b64decode(base64_image)

        def _call() -> str:
            client = _get_client()
            response = client.models.generate_content(
                model=MODEL,
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                    f"{system_prompt}\n\n请分析这道题并给出详细解答：",
                ],
                config=types.GenerateContentConfig(temperature=0.3),
            )
            return response.text

        return await asyncio.to_thread(_call)

    @staticmethod
    async def search_notes(query: str, subject: str = "general") -> str:
        subject_cn = {
            "chinese": "语文",
            "math": "数学",
            "english": "英语",
            "physics": "物理",
            "chemistry": "化学",
            "politics": "政治",
        }.get(subject, "综合")

        system_prompt = (
            f"你是一位{subject_cn}学科的高中老师和学习笔记专家。"
            "请根据学生的查询，生成一份清晰、条理分明的学习笔记。"
            "笔记应包含：核心概念、关键公式/要点、典型例题、易错点提醒。"
            "使用Markdown格式，方便学生阅读和复习。"
        )
        prompt = f"{system_prompt}\n\n请为以下内容生成学习笔记：\n\n{query}"
        return await asyncio.to_thread(_generate, [prompt], 0.5)

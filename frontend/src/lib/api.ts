import type {
  Exam,
  ExamCreate,
  Diagnosis,
  Plan,
  DailyTask,
  WrongQuestion,
  WrongQuestionCreate,
  WrongQuestionUpdate,
  AIFeedback,
  WeeklyReview,
  UserProfile,
  RecognizedQuestion,
} from "@/types";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const fullUrl = url.startsWith("/api") ? `${API_BASE}${url}` : url;
  const res = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw new ApiError(errText, res.status);
  }

  const body = await res.text();
  if (!body) return undefined as T;
  return JSON.parse(body);
}

// User Profile
export async function getUserProfile(): Promise<UserProfile> {
  return request<UserProfile>("/api/user/profile");
}

export async function updateUserProfile(
  data: Partial<UserProfile>
): Promise<UserProfile> {
  return request<UserProfile>("/api/user/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Exams
export async function createExam(data: ExamCreate): Promise<Exam> {
  return request<Exam>("/api/exams", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getExams(): Promise<Exam[]> {
  return request<Exam[]>("/api/exams");
}

// Diagnosis
export async function getDiagnosis(): Promise<Diagnosis> {
  return request<Diagnosis>("/api/diagnosis");
}

// Plans
export async function generatePlan(startDate?: string): Promise<Plan> {
  return request<Plan>("/api/plan/generate", {
    method: "POST",
    body: JSON.stringify(startDate ? { start_date: startDate } : {}),
  });
}

export async function getWeeklyPlan(): Promise<Plan> {
  return request<Plan>("/api/plan/weekly");
}

// Daily Tasks
export async function getDailyTasks(date: string): Promise<DailyTask[]> {
  return request<DailyTask[]>(`/api/tasks/daily?date=${date}`);
}

export async function completeTask(id: string): Promise<DailyTask> {
  return request<DailyTask>(`/api/tasks/${id}/complete`, {
    method: "PUT",
  });
}

// Wrong Questions
export async function createWrongQuestion(
  data: WrongQuestionCreate
): Promise<WrongQuestion> {
  return request<WrongQuestion>("/api/wrong-questions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getWrongQuestions(params?: {
  subject?: string;
  knowledge_point?: string;
}): Promise<WrongQuestion[]> {
  const searchParams = new URLSearchParams();
  if (params?.subject) searchParams.set("subject", params.subject);
  if (params?.knowledge_point)
    searchParams.set("knowledge_point", params.knowledge_point);
  const qs = searchParams.toString();
  return request<WrongQuestion[]>(`/api/wrong-questions${qs ? `?${qs}` : ""}`);
}

export async function updateWrongQuestion(
  id: string,
  data: WrongQuestionUpdate
): Promise<WrongQuestion> {
  return request<WrongQuestion>(`/api/wrong-questions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// AI Review
export async function chineseReview(text: string): Promise<AIFeedback> {
  return request<AIFeedback>("/api/ai/chinese-review", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function politicsReview(
  question: string,
  answer: string
): Promise<AIFeedback> {
  return request<AIFeedback>("/api/ai/politics-review", {
    method: "POST",
    body: JSON.stringify({ question, answer }),
  });
}

export async function analyzeImage(
  base64Image: string,
  subject?: string
): Promise<AIFeedback> {
  return request<AIFeedback>("/api/ai/analyze-image", {
    method: "POST",
    body: JSON.stringify({ base64_image: base64Image, subject }),
  });
}

export async function searchNotes(
  query: string,
  subject?: string
): Promise<AIFeedback> {
  return request<AIFeedback>("/api/ai/search-notes", {
    method: "POST",
    body: JSON.stringify({ query, subject }),
  });
}

// Weekly Review
export async function getWeeklyReview(): Promise<WeeklyReview> {
  return request<WeeklyReview>("/api/weekly-review");
}

// New AI endpoints
export async function recognizeQuestion(base64Image: string, subject?: string) {
  return request<RecognizedQuestion>("/api/ai/recognize-question", {
    method: "POST",
    body: JSON.stringify({ base64_image: base64Image, subject }),
  });
}

export async function generateSimilarQuestions(data: {
  question_text: string;
  subject: string;
  knowledge_point: string;
  error_reason: string;
}) {
  return request<AIFeedback>("/api/ai/similar-questions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function checkAnswer(data: {
  question: string;
  subject: string;
  user_answer: string;
}) {
  return request<AIFeedback>("/api/ai/check-answer", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function reviewEnglish(text: string) {
  return request<AIFeedback>("/api/ai/english-review", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

// Delete endpoints
export async function deleteExam(id: string) {
  return request<void>(`/api/exams/${id}`, { method: "DELETE" });
}

export async function deleteWrongQuestion(id: string) {
  return request<void>(`/api/wrong-questions/${id}`, { method: "DELETE" });
}

export async function deleteTask(id: string) {
  return request<void>(`/api/tasks/${id}`, { method: "DELETE" });
}

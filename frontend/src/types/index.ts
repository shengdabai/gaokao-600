// User Profile
export interface UserProfile {
  id: string;
  name: string;
  target_total_score: number;
  target_chinese: number;
  target_math: number;
  target_english: number;
  target_physics: number;
  target_chemistry: number;
  target_politics: number;
  schedule_json: string;
}

// Exam
export interface Exam {
  id: string;
  user_id: string;
  exam_name: string;
  exam_date: string;
  chinese_score: number;
  math_score: number;
  english_score: number;
  physics_score: number;
  chemistry_score: number;
  politics_score: number;
  total_score: number;
  created_at: string;
}

export interface ExamCreate {
  exam_name: string;
  exam_date: string;
  chinese_score?: number;
  math_score?: number;
  english_score?: number;
  physics_score?: number;
  chemistry_score?: number;
  politics_score?: number;
}

// Diagnosis
export interface SubjectGap {
  subject: string;
  subject_cn: string;
  current: number;
  target: number;
  gap: number;
  weighted_gap: number;
  priority_rank: number;
}

export interface Diagnosis {
  total_current: number;
  total_target: number;
  total_gap: number;
  subject_gaps: SubjectGap[];
  error?: string;
}

// Plan
export interface Plan {
  id: string;
  user_id: string;
  plan_type: string;
  title: string;
  content: string; // JSON string
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

// Daily Task
export interface DailyTask {
  id: string;
  user_id: string;
  subject: string;
  title: string;
  description?: string;
  scheduled_date: string;
  estimated_minutes: number;
  completed: boolean;
  plan_id?: string;
  created_at: string;
}

// Wrong Question
export interface WrongQuestion {
  id: string;
  user_id: string;
  subject: string;
  question_text: string;
  user_answer: string;
  correct_answer: string;
  error_reason: string;
  knowledge_point: string;
  mastery_status: "not_mastered" | "reviewing" | "mastered";
  next_review_date: string;
  review_count: number;
  created_at: string;
}

export interface WrongQuestionCreate {
  subject: string;
  question_text: string;
  user_answer?: string;
  correct_answer?: string;
  error_reason?: string;
  knowledge_point?: string;
}

export interface WrongQuestionUpdate {
  mastery_status?: string;
  error_reason?: string;
  knowledge_point?: string;
  user_answer?: string;
  correct_answer?: string;
}

// AI Review - all return {feedback: string}
export interface AIFeedback {
  feedback: string;
}

// Weekly Review
export interface SubjectBreakdown {
  subject_cn: string;
  total: number;
  completed: number;
  total_minutes: number;
}

export interface WeeklyReview {
  week_start: string;
  week_end: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  wrong_questions_reviewed: number;
  wrong_questions_mastered: number;
  subject_breakdown: Record<string, SubjectBreakdown>;
  suggestions: string[];
  ai_summary?: string;
}

// Subject config (for UI)
export interface SubjectConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  target: number;
}

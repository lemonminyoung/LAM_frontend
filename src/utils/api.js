// API 호출 유틸리티

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * 로그인 API
 * POST /login
 * 백엔드: FastAPI (Api.py)
 */
export const loginApi = async (studentId, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      student_id: studentId,
      password: password,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || "로그인에 실패했습니다.");
  }

  const data = await response.json();

  // 백엔드 응답: { ok: true, student_id: "...", message: "..." }
  if (!data.ok) {
    throw new Error(data.message || "로그인에 실패했습니다.");
  }

  return data;
};

/**
 * 프롬프트 전송 API
 * POST /prompt
 * 백엔드: FastAPI (Api.py)
 */
export const sendPromptApi = async (text) => {
  const response = await fetch(`${API_BASE_URL}/prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || "메시지 전송에 실패했습니다.");
  }

  const data = await response.json();

  // 백엔드 응답: { ok: true, prompt_text: "...", message: "..." }
  if (!data.ok) {
    throw new Error(data.message || "메시지 전송에 실패했습니다.");
  }

  return data;
};

// API 호출 유틸리티

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

/**
 * 로그인 API
 * POST /login
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
    throw new Error(error.message || "로그인에 실패했습니다.");
  }

  return await response.json();
};

/**
 * 로그인 상태 확인 API (폴링용)
 * GET /login-status
 */
export const checkLoginStatusApi = async (token) => {
  const response = await fetch(`${API_BASE_URL}/login-status?token=${token}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "로그인 상태 확인에 실패했습니다.");
  }

  return await response.json();
};

/**
 * 프롬프트 전송 API
 * POST /prompt
 */
export const sendPromptApi = async (text, token) => {
  const response = await fetch(`${API_BASE_URL}/prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      text: text,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "메시지 전송에 실패했습니다.");
  }

  return await response.json();
};

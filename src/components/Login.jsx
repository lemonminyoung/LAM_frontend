import { useState } from "react";
import { loginApi } from "../utils/api";

function Login({ onLoginSuccess, onLoginError }) {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) {
      setError("학번과 비밀번호를 입력해주세요.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // API 호출 - POST /login
      const data = await loginApi(studentId, password);

      console.log("로그인 API 응답:", data);

      // 백엔드 응답: { ok: true, student_id: "...", message: "..." }
      if (data.ok) {
        // 로그인 성공 - 채팅 화면으로 전환
        console.log("로그인 성공:", data.student_id);
        onLoginSuccess({
          studentId: data.student_id,
          name: data.student_id, // 백엔드에서 name을 제공하지 않으므로 student_id 사용
        });
      }
    } catch (err) {
      console.error("로그인 오류:", err);

      // 로그인 실패 - 에러 화면으로 돌아감
      if (onLoginError) {
        onLoginError();
      }

      // 에러 메시지 표시
      setError(err.message || "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>nDRIMS 로그인</h1>

      <form onSubmit={handleSubmit} className="login-form">
        {error && <div className="error-message">{error}</div>}

        <div className="login-input">
          <input
            type="text"
            placeholder="학번을 입력하세요..."
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
        </div>

        <div className="login-input">
          <input
            type="password"
            placeholder="비밀번호를 입력하세요..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="test-accounts">
        <p>테스트 계정 (Mock 모드):</p>
        <ul>
          <li>2022112456 / a1637528!</li>
        </ul>
      </div>
    </div>
  );
}

export default Login;

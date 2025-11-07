import { useState, useEffect } from "react";
import ChatInput from "./components/ChatInput";
import Login from "./components/Login";
import { sendPromptApi } from "./utils/api";
import "./App.css";

function App() {
  const [loginState, setLoginState] = useState("logged_out"); // "logged_out" | "logged_in"
  const [messages, setMessages] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  // 컴포넌트 마운트 시 localStorage에서 로그인 정보 확인
  useEffect(() => {
    const savedUserInfo = localStorage.getItem("userInfo");

    if (savedUserInfo) {
      setLoginState("logged_in");
      setUserInfo(JSON.parse(savedUserInfo));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    // 로그인 성공 - 즉시 채팅 화면으로 전환
    console.log("로그인 성공:", userData);

    // localStorage에 저장
    localStorage.setItem("userInfo", JSON.stringify(userData));

    setLoginState("logged_in");
    setUserInfo(userData);
  };

  const handleLoginError = () => {
    // 로그인 실패 시 다시 로그인 화면으로
    setLoginState("logged_out");
  };

  const handleLogout = () => {
    // 로그아웃 시 localStorage 클리어
    localStorage.removeItem("userInfo");

    setLoginState("logged_out");
    setUserInfo(null);
    setMessages([]);
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // 사용자 메시지를 즉시 화면에 표시
    const userMessage = {
      id: Date.now(),
      content: text,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // API 호출 - POST /prompt
      const response = await sendPromptApi(text);

      console.log("프롬프트 응답:", response);

      // 백엔드 응답: { ok: true, prompt_text: "...", message: "..." }
      const botMessage = {
        id: Date.now() + 1,
        content: response.message || "프롬프트가 전달되었습니다.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("메시지 전송 오류:", err);

      // 에러 메시지 표시
      const errorMessage = {
        id: Date.now() + 1,
        content: `오류: ${err.message}`,
        sender: "system",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // 로그인 상태에 따라 화면 표시
  if (loginState === "logged_out") {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onLoginError={handleLoginError}
      />
    );
  }

  // 로그인 후 채팅 화면 표시
  return (
    <div className="app">
      <div className="app-header">
        <h1>nDRIMS에서 하고싶은 무엇이든 물어보세요!</h1>
        <div className="user-info">
          <span>{userInfo?.name}님 환영합니다!</span>
          <button onClick={handleLogout} className="logout-button">
            로그아웃
          </button>
        </div>
      </div>

      <div className="chat-box">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender === "user" ? "user" : msg.sender === "system" ? "system" : "bot"}`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
}

export default App;

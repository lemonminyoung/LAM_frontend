import { useState, useEffect, useRef } from "react";
import ChatInput from "./components/ChatInput";
import Login from "./components/Login";
import LoadingScreen from "./components/LoadingScreen";
import { sendPromptApi, checkLoginStatusApi } from "./utils/api";
import "./App.css";

function App() {
  const [loginState, setLoginState] = useState("logged_out"); // "logged_out" | "pending" | "logged_in"
  const [messages, setMessages] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [pendingToken, setPendingToken] = useState(null); // 폴링할 토큰
  const pollingIntervalRef = useRef(null); // 폴링 interval 참조

  // 컴포넌트 마운트 시 localStorage에서 로그인 정보 확인
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUserInfo = localStorage.getItem("userInfo");

    if (token && savedUserInfo) {
      setLoginState("logged_in");
      setUserInfo(JSON.parse(savedUserInfo));
    }
  }, []);

  // 로그인 상태 폴링 (pending 상태일 때만)
  useEffect(() => {
    if (loginState === "pending" && pendingToken) {
      console.log("로그인 상태 폴링 시작 (5초 간격)");

      // 즉시 한번 체크
      checkLoginStatus();

      // 5초마다 폴링
      pollingIntervalRef.current = setInterval(() => {
        checkLoginStatus();
      }, 5000); // 5초

      // cleanup: 폴링 중지
      return () => {
        if (pollingIntervalRef.current) {
          console.log("로그인 상태 폴링 중지");
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [loginState, pendingToken]);

  // 로그인 상태 확인 함수
  const checkLoginStatus = async () => {
    if (!pendingToken) return;

    try {
      console.log("로그인 상태 확인 중...");
      const data = await checkLoginStatusApi(pendingToken);

      console.log("로그인 상태:", data);

      if (data.status === "success") {
        // 로그인 완료
        console.log("로그인 완료!");

        // localStorage에 저장
        localStorage.setItem("token", data.userData.token);
        localStorage.setItem("userInfo", JSON.stringify(data.userData));

        setLoginState("logged_in");
        setUserInfo(data.userData);
        setPendingToken(null);

        // 폴링 중지
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      } else if (data.status === "failed") {
        // 로그인 실패
        console.error("로그인 실패:", data.message);
        setLoginState("logged_out");
        setPendingToken(null);

        // 폴링 중지
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }

        alert(data.message || "로그인에 실패했습니다.");
      } else {
        // 아직 진행 중
        console.log(`로그인 진행 중... (경과 시간: ${data.elapsed}초)`);
      }
    } catch (err) {
      console.error("로그인 상태 확인 오류:", err);
      // 오류 발생 시에도 계속 폴링 (일시적 네트워크 오류일 수 있음)
    }
  };

  const handleLoginPending = (token) => {
    // 로그인 요청 접수 - 폴링 시작
    console.log("로그인 요청 접수, 토큰:", token);
    setPendingToken(token);
    setLoginState("pending");
  };

  const handleLoginImmediate = (userData) => {
    // 즉시 로그인 성공 (폴링 없이)
    localStorage.setItem("token", userData.token);
    localStorage.setItem("userInfo", JSON.stringify(userData));

    setLoginState("logged_in");
    setUserInfo(userData);
  };

  const handleLoginError = () => {
    // 로그인 실패 시 다시 로그인 화면으로
    setLoginState("logged_out");
    setPendingToken(null);
  };

  const handleLogout = () => {
    // 로그아웃 시 localStorage 클리어
    localStorage.removeItem("token");
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
      const token = localStorage.getItem("token");
      const response = await sendPromptApi(text, token);

      console.log("프롬프트 응답:", response);

      // 응답 메시지를 화면에 표시
      const botMessage = {
        id: Date.now() + 1,
        content: response.message || "응답을 받았습니다.",
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
        onLoginPending={handleLoginPending}
        onLoginImmediate={handleLoginImmediate}
        onLoginError={handleLoginError}
      />
    );
  }

  if (loginState === "pending") {
    return <LoadingScreen message="로그인 중" />;
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

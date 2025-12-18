import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo1234");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "register") {
        await register({ email, password });
        setMessage("注册成功，请登录");
        setMode("login");
        return;
      }
      await login(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      setMessage(error?.response?.data?.detail ?? "操作失败");
    }
  };

  return (
    <main className="page">
      <header>
        <p className="badge">身份验证</p>
        <h1>{mode === "login" ? "登录" : "注册"}</h1>
        <p>演示用账号默认填好，直接提交即可。</p>
      </header>
      <form className="panel" onSubmit={handleSubmit}>
        <label className="field">
          <span>邮箱</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label className="field">
          <span>密码</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        {message && <p className="notice">{message}</p>}
        <div className="actions">
          <button type="submit" className="btn primary">
            {mode === "login" ? "登录" : "注册"}
          </button>
          <button type="button" className="btn" onClick={() => setMode(mode === "login" ? "register" : "login")}>
            切换到{mode === "login" ? "注册" : "登录"}
          </button>
        </div>
      </form>
    </main>
  );
}

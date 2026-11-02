import "../assets/css/loginForm.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true } // cookie yi alabilmek için 
      );

      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Giriş sırasında bir hata oluştu"
      );
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        
        {error && (
          <div className="alert alert-danger py-2 mb-3 text-center">
            {error}
          </div>
        )}

        <div className="input-group mb-3">
          <span className="input-group-text login-icon">
            <i className="bi bi-envelope"></i>
          </span>
          <input
            type="email"
            className="form-control login-input"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group mb-4">
          <span className="input-group-text login-icon">
            <i className="bi bi-lock"></i>
          </span>
          <input
            type="password"
            className="form-control login-input"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100 login-btn">
          Giriş Yap
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
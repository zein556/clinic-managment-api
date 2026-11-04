
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { loginUser, registerUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const switchMode = () => {
    setIsLogin(!isLogin);

    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    setMessage("");
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      setMessageType("error");
      return;
    }

    try {
      setIsLoading(true);

      if (isLogin) {
      const data = await loginUser(
  formData.email,
  formData.password
);

// Debug: inspect the login response
console.log("LOGIN RESPONSE:", data);
console.log("USER OBJECT:", data.user);
console.log("USER NAME:", data.user?.name);

// Save user data
localStorage.setItem("user", JSON.stringify(data.user));
        // Redirect according to role
        switch (data.user.role) {
          case "admin":
            navigate("/admin", { replace: true });
            break;

          case "doctor":
            navigate("/doctor", { replace: true });
            break;

          case "patient":
            navigate("/patient", { replace: true });
            break;

          default:
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setMessage("Unknown user role.");
            setMessageType("error");
        }
      } else {
        const data = await registerUser(
          formData.username,
          formData.email,
          formData.password
        );

        setMessage(data.message || "Registration successful!");
        setMessageType("success");

        setIsLogin(true);

        setFormData({
          username: "",
          email: formData.email,
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      setMessage(error.message || "Something went wrong!");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="medical-section">
          <div className="medical-overlay"></div>

          <div className="medical-content">
            <div className="brand">
              <div className="brand-icon">✚</div>
              <span>CarePoint</span>
            </div>

            <div className="medical-message">
              <span className="welcome-tag">
                YOUR HEALTH, OUR PRIORITY
              </span>

              <h1>
                Better Care.
                <br />
                Better Life.
              </h1>

              <p>
                Experience modern healthcare management.
                Connect with doctors, manage appointments,
                and take control of your health journey.
              </p>

              <div className="medical-features">
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  Trusted Medical Professionals
                </div>

                <div className="feature">
                  <span className="feature-icon">✓</span>
                  Easy Appointment Management
                </div>

                <div className="feature">
                  <span className="feature-icon">✓</span>
                  Secure Medical Records
                </div>
              </div>
            </div>

            <div className="medical-footer">
              <span>CarePoint Medical Center</span>
              <span>© 2026 All rights reserved</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-wrapper">

            <div className="mobile-brand">
              <div className="brand-icon">✚</div>
              <span>CarePoint</span>
            </div>

            <div className="form-heading">
              <span className="form-label">
                {isLogin ? "WELCOME BACK" : "JOIN OUR COMMUNITY"}
              </span>

              <h2>
                {isLogin ? "Sign In" : "Create Account"}
              </h2>

              <p>
                {isLogin
                  ? "Please enter your details to access your account."
                  : "Create your account to get started with us."}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="input-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Password</label>

                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="input-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {isLogin && (
                <div className="form-options">
                  <label className="remember">
                    <input type="checkbox" />
                    Remember me
                  </label>

                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() => {
                      setMessage("Password recovery will be added later.");
                      setMessageType("error");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {message && (
                <div className={`form-message ${messageType}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading
                  ? "Please wait..."
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}

                {!isLoading && <span>→</span>}
              </button>
            </form>

            <div className="switch-form">
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}

              <button type="button" onClick={switchMode}>
                {isLogin ? "Create account" : "Sign in"}
              </button>
            </div>

            <div className="security-note">
              <span>🔒</span>
              Your information is protected and secure.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

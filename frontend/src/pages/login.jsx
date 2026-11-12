
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
    phone: "",
    age: "",
    gender: "",
    medical_history: "",
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
      phone: "",
      age: "",
      gender: "",
      medical_history: "",
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

        console.log("LOGIN RESPONSE:", data);
        console.log("USER OBJECT:", data.user);
        console.log("USER NAME:", data.user?.name);

        localStorage.setItem("user", JSON.stringify(data.user));

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
          formData.password,
          formData.phone,
          formData.age,
          formData.gender,
          formData.medical_history
        );

        setMessage(data.message || "Registration successful!");
        setMessageType("success");

        setIsLogin(true);

        setFormData({
          username: "",
          email: formData.email,
          password: "",
          confirmPassword: "",
          phone: "",
          age: "",
          gender: "",
          medical_history: "",
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
                <>
                  <div className="input-group">
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleChange}
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      placeholder="Enter your age"
                      value={formData.age}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Select your gender
                      </option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="input-group medical-history-group">
                    <label>
                      Medical History
                      <span className="optional-label">Optional</span>
                    </label>

                    <textarea
                      name="medical_history"
                      placeholder="Describe any previous or current medical conditions, allergies, or surgeries (if any)"
                      value={formData.medical_history}
                      onChange={handleChange}
                      rows="4"
                    />

                    <span className="field-hint">
                      You can leave this field empty if you prefer to provide
                      your medical information later.
                    </span>
                  </div>
                </>
              )}

              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
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
                    autoComplete={isLogin ? "current-password" : "new-password"}
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
                    autoComplete="new-password"
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

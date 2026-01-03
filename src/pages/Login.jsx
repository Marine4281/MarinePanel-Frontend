import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // <-- added state

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      toast.success("Login successful!");
      if (res.data.isAdmin) {
        navigate("/admin");
      } else {
      navigate("/home"); // redirect
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return toast.error("Please enter your email first");

    try {
      await API.post("/auth/forgot-password", { email });
      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="w-full max-w-md p-6 bg-white rounded-2xl shadow" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border rounded-xl"
          required
        />

        {/* Password with show/hide */}
        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"} // toggle type
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-sm text-gray-500"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="text-right mb-4">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-blue-600 text-sm hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <button type="submit" className="w-full bg-orange-500 text-white p-3 rounded-xl hover-bg-orange-600 hover:scale-110 mb-4">
          Login
        </button>

        <p className="text-center text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-orange-600 font-semibold">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
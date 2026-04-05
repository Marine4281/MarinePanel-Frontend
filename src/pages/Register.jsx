// src/pages/Register.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // ✅ Default country = Kenya (better for your current testing)
  // Backend expects lowercase ISO2 for countryCode
  const [country, setCountry] = useState({
    name: "Kenya",
    code: "ke",
  });

  // UI country for PhoneInput (must stay lowercase ISO2)
  const [phoneCountry, setPhoneCountry] = useState("ke");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  // ===============================================
  // ✅ SIMPLE EMAIL VALIDATION
  // ===============================================
  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  // ===============================================
  // ✅ HANDLE SUBMIT
  // ===============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanEmail || !cleanPhone || !password || !confirmPassword) {
      return toast.error("Please fill all fields");
    }

    if (!isValidEmail(cleanEmail)) {
      return toast.error("Please enter a valid email");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);

      const payload = {
        email: cleanEmail,
        phone: cleanPhone,
        country: country.name || "Kenya",
        countryCode: (country.code || "ke").toLowerCase().trim(), // ✅ always lowercase
        password,
      };

      const res = await API.post("/auth/register", payload);

      toast.success("Registration successful!");

      // ✅ If backend returns token + user
      login(res.data);

      navigate("/home");
    } catch (err) {
      console.error("❌ Registration error:", err.response?.data || err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Registration failed";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ===============================================
  // ✅ HANDLE PHONE + COUNTRY SYNC
  // ===============================================
  const handlePhoneChange = (value, data) => {
    setPhone(value);

    // Always safe lowercase ISO2
    const iso2 = (data?.countryCode || "ke").toLowerCase().trim();

    setPhoneCountry(iso2);

    setCountry({
      name: data?.name || "Kenya",
      code: iso2,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Register</h2>

        {/* Email */}
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
            placeholder="Enter your email"
            autoComplete="email"
            disabled={loading}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block font-semibold mb-1">Phone</label>

          <PhoneInput
            country={phoneCountry}
            value={phone}
            onChange={handlePhoneChange}
            enableSearch
            searchPlaceholder="Search country..."
            disableCountryGuess={true}
            countryCodeEditable={false}
            preferredCountries={["ke", "us", "gb"]}
            containerClass="w-full"
            inputClass="!w-full !pl-14 !pr-3 !py-3 !rounded-xl !border focus:!ring-2 focus:!ring-orange-400"
            buttonClass="!border !rounded-l-xl !px-2 !bg-white"
            dropdownClass="!rounded-xl !shadow-lg"
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="relative">
          <label className="block font-semibold mb-1">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
            placeholder="Enter password"
            autoComplete="new-password"
            disabled={loading}
          />
          <button
            type="button"
            className="absolute right-3 top-10 text-sm text-gray-500"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={loading}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <label className="block font-semibold mb-1">Confirm Password</label>
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
            placeholder="Confirm password"
            autoComplete="new-password"
            disabled={loading}
          />
          <button
            type="button"
            className="absolute right-3 top-10 text-sm text-gray-500"
            onClick={() => setShowConfirm((prev) => !prev)}
            disabled={loading}
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-orange-500 text-white p-3 rounded-xl font-semibold transition ${
            loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-orange-600 hover:scale-[1.02]"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {/* Login */}
        <p className="text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-600 font-semibold">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;

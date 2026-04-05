// src/pages/Register.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // ✅ Country for backend (ALWAYS lowercase ISO2)
  const [country, setCountry] = useState({
    name: "United States",
    code: "us", // ✅ FIXED (was "US")
  });

  // ✅ PhoneInput UI country (must always be lowercase ISO2)
  const [phoneCountry, setPhoneCountry] = useState("us");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !phone || !password || !confirmPassword) {
      return toast.error("Please fill all fields");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/register", {
        email,
        phone,
        country: country.name,
        countryCode: country.code, // ✅ already lowercase
        password,
      });

      toast.success("Registration successful!");
      login(res.data);
      navigate("/home");
    } catch (err) {
      console.error("Registration error:", err.response || err);

      const message =
        err.response?.data?.message || err.message || "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
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
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block font-semibold mb-1">Phone</label>

          <PhoneInput
            country={phoneCountry}
            value={phone}
            enableSearch
            searchPlaceholder="Search country..."
            disableCountryGuess={true}
            countryCodeEditable={false}
            preferredCountries={["ke", "us", "gb"]}
            onChange={(value, data) => {
              setPhone(value);

              // ✅ Always safe ISO2 (force lowercase + trim)
              const iso2 = (data?.countryCode || "us")
                .toLowerCase()
                .trim();

              setPhoneCountry(iso2);

              // ✅ Sync backend country correctly (FIXED)
              setCountry({
                name: data?.name || "",
                code: iso2, // ✅ FIXED (removed toUpperCase)
              });
            }}
            containerClass="w-full"
            inputClass="!w-full !pl-14 !pr-3 !py-3 !rounded-xl !border focus:!ring-2 focus:!ring-orange-400"
            buttonClass="!border !rounded-l-xl !px-2 !bg-white"
            dropdownClass="!rounded-xl !shadow-lg"
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
          />
          <button
            type="button"
            className="absolute right-3 top-10 text-sm text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
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
          />
          <button
            type="button"
            className="absolute right-3 top-10 text-sm text-gray-500"
            onClick={() => setShowConfirm(!showConfirm)}
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
          <a href="/login" className="text-orange-600 font-semibold">
            Login
          </a>
        </p>
      </form>
    </div>
  );
};

export default Register;

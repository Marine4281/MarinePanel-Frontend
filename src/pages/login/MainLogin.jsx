import { useState } from "react"; import { Link, useNavigate } from "react-router-dom"; import { useAuth } from "../../context/AuthContext"; import API from "../../api/axios"; import toast from "react-hot-toast"; import { motion } from "framer-motion";

const BRAND_COLOR = "#f97316";

const IconEye = () => ( <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /> <circle cx="12" cy="12" r="3" /> </svg> );

const IconEyeOff = () => ( <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /> <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /> <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /> <line x1="2" y1="2" x2="22" y2="22" /> </svg> );

const FEATURES = [ { emoji: "⚡", title: "Instant Delivery", desc: "Orders are processed in seconds with fully automated delivery.", }, { emoji: "💰", title: "Best Market Prices", desc: "Industry-leading affordable pricing with reseller discounts.", }, { emoji: "🔒", title: "Secure & Private", desc: "Protected transactions and full account privacy guaranteed.", }, { emoji: "🌍", title: "Global Payments", desc: "M-Pesa, MTN MoMo, Cards, Crypto, PayPal and more.", }, ];

export default function MainLogin() { const { login } = useAuth(); const navigate = useNavigate();

const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [showPassword, setShowPassword] = useState(false); const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (e) => { e.preventDefault(); setSubmitting(true);

try {
  const res = await API.post("/auth/login", { email, password });
  login(res.data);
  toast.success("Login successful!");

  if (res.data.isAdmin) navigate("/admin");
  else if (res.data.isChildPanel) navigate("/child-panel/dashboard");
  else navigate("/home");
} catch (err) {
  toast.error(err.response?.data?.message || "Login failed");
} finally {
  setSubmitting(false);
}

};

const handleForgotPassword = async () => { if (!email) return toast.error("Please enter your email first");

try {
  await API.post("/auth/forgot-password", { email });
  toast.success("Password reset link sent!");
} catch (err) {
  toast.error(err.response?.data?.message || "Failed to send reset link");
}

};

return ( <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-50 flex"> {/* LEFT SIDE */} <div className="hidden lg:flex w-[55%] relative overflow-hidden px-16 py-14 flex-col justify-between"> <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-20 bg-orange-300" /> <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-3xl opacity-20 bg-indigo-300" />

<div className="relative z-10 flex items-center gap-3">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${BRAND_COLOR}, #fb923c)`,
        }}
      >
        M
      </div>
      <div>
        <h2 className="font-bold text-xl text-gray-900">MarinePanel</h2>
        <p className="text-sm text-gray-400">Premium SMM Platform</p>
      </div>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative z-10"
    >
      <h1 className="text-5xl font-black text-gray-900 leading-tight mb-5">
        Scale Faster With The
        <span className="block" style={{ color: BRAND_COLOR }}>
          Best SMM Platform
        </span>
      </h1>

      <p className="text-gray-500 text-lg max-w-lg leading-relaxed mb-10">
        Deliver social media growth services instantly with powerful automation,
        unbeatable pricing, and a complete reseller ecosystem.
      </p>

      <div className="grid gap-4 max-w-lg">
        {FEATURES.map((item) => (
          <motion.div
            whileHover={{ y: -2 }}
            key={item.title}
            className="bg-white/80 backdrop-blur-md border border-white rounded-3xl p-5 shadow-lg shadow-gray-100"
          >
            <div className="flex items-start gap-4">
              <div className="text-2xl">{item.emoji}</div>
              <div>
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>

    <p className="text-sm text-gray-400 relative z-10">
      Trusted by thousands of resellers worldwide • Instant activation • 24/7 support
    </p>
  </div>

  {/* RIGHT SIDE */}
  <div className="flex-1 flex items-center justify-center px-6 py-10">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[440px]"
    >
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black"
          style={{
            background: `linear-gradient(135deg, ${BRAND_COLOR}, #fb923c)`,
          }}
        >
          M
        </div>
        <span className="font-bold text-xl text-gray-800">MarinePanel</span>
      </div>

      <div className="bg-white/90 backdrop-blur-xl border border-white rounded-[30px] shadow-2xl shadow-gray-200 p-8 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm">
            Sign in to continue managing your services.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition-all focus:ring-4 text-sm"
              style={{
                focusRingColor: `${BRAND_COLOR}20`,
              }}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-14 px-5 pr-14 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition-all text-sm"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-medium hover:underline"
              style={{ color: BRAND_COLOR }}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 rounded-2xl font-bold text-white text-sm shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg, ${BRAND_COLOR}, #fb923c)`,
            }}
          >
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-7">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-300">OR</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <p className="text-center text-sm text-gray-500">
          Don’t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold hover:underline"
            style={{ color: BRAND_COLOR }}
          >
            Create one free
          </Link>
        </p>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400 mb-3">Accepted Payment Methods</p>
        <div className="flex flex-wrap justify-center gap-2">
          {["M-Pesa", "MTN MoMo", "Visa", "Mastercard", "Crypto", "PayPal", "Stripe"].map((item) => (
            <span
              key={item}
              className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-500"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-gray-300 mt-6">
        © {new Date().getFullYear()} MarinePanel • All rights reserved
      </p>
    </motion.div>
  </div>
</div>

); }

// src/pages/landing/templates/DefaultLanding.jsx
import { Link } from "react-router-dom";

export default function DefaultLanding({ brandName, themeColor, logo }) {
  const heroBg = `linear-gradient(135deg, ${themeColor}dd 0%, ${themeColor}88 60%, ${themeColor}33 100%)`;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Hero */}
      <section
        className="flex-1 flex flex-col justify-center items-center text-center text-white px-6 py-24 relative overflow-hidden"
        style={{ background: heroBg }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px),
                            radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />

        {logo && (
          <img src={logo} alt={brandName} className="h-20 w-20 rounded-2xl object-contain mb-6 shadow-2xl ring-4 ring-white/20" />
        )}

        <h1 className="text-5xl md:text-7xl font-extrabold mb-5 tracking-tight drop-shadow-xl">
          {brandName}
        </h1>
        <p className="text-xl md:text-2xl mb-10 max-w-2xl opacity-90 leading-relaxed">
          Professional SMM services. Grow your social media presence with fast, reliable, and affordable solutions.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link
            to="/register"
            className="px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-all duration-200"
            style={{ backgroundColor: "white", color: themeColor }}
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="px-10 py-4 rounded-2xl font-bold text-lg border-2 border-white/60 hover:bg-white/10 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full">
          {[
            { value: "2M+", label: "Orders Completed" },
            { value: "24/7", label: "Support Available" },
            { value: "100+", label: "Services Offered" },
            { value: "99.9%", label: "Uptime Guarantee" },
          ].map((s) => (
            <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/20 transition-all">
              <div className="text-3xl font-black">{s.value}</div>
              <div className="text-sm opacity-80 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "⚡", title: "Lightning Fast", desc: "Orders start within seconds of placement. No waiting around." },
              { icon: "🔒", title: "100% Secure", desc: "Your data and transactions are always protected with us." },
              { icon: "💰", title: "Best Prices", desc: "Competitive pricing with wholesale rates for bulk orders." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-white text-sm font-medium" style={{ backgroundColor: themeColor }}>
        &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
      </footer>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </div>
  );
}

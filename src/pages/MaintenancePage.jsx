// src/pages/MaintenancePage.jsx
export default function MaintenancePage({ title, message }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-blue-600/20 border border-blue-500/30 rounded-3xl flex items-center justify-center rotate-12">
              <i className="fa-solid fa-gear text-blue-400 text-4xl" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-wrench text-amber-400 text-sm" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-extrabold text-white mb-3 leading-tight">
          {title || "We're Under Maintenance"}
        </h1>

        <p className="text-gray-400 text-base leading-relaxed mb-8">
          {message || "Our platform is currently undergoing scheduled maintenance. We'll be back shortly!"}
        </p>

        {/* Status indicators */}
        <div className="flex justify-center gap-3 flex-wrap mb-8">
          <StatusDot color="amber" label="Maintenance in progress" />
          <StatusDot color="blue" label="Estimated downtime: Soon™" />
        </div>

        {/* Animated loader */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <p className="text-gray-600 text-xs mt-8">
          © {new Date().getFullYear()} MarinePanel. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function StatusDot({ color, label }) {
  const colors = {
    amber: "bg-amber-500 shadow-amber-500/50",
    blue: "bg-blue-500 shadow-blue-500/50",
    green: "bg-emerald-500 shadow-emerald-500/50",
  };
  return (
    <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-4 py-1.5">
      <span className={`w-2 h-2 rounded-full shadow-lg animate-pulse ${colors[color]}`} />
      <span className="text-gray-400 text-xs">{label}</span>
    </div>
  );
}

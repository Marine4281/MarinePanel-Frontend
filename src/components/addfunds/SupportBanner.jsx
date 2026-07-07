const SupportBanner = ({ userUnread, fmt, onGetHelp }) => (
  <div className="relative overflow-hidden rounded-2xl shadow-md">
    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400" />
    <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
    <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
    <div className="absolute top-2 right-24 w-12 h-12 bg-white/10 rounded-full pointer-events-none" />

    <div className="relative flex items-center justify-between gap-4 px-6 py-5">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
          <i className="fas fa-headset text-white text-xl" />
        </div>
        <div>
          <p className="text-white font-extrabold text-sm leading-tight">
            Having trouble with a payment?
          </p>
          <p className="text-orange-100 text-xs mt-0.5">
            Our support team is available to help you instantly
          </p>
        </div>
      </div>

      <button
        onClick={onGetHelp}
        className="relative shrink-0 bg-white hover:bg-orange-50 text-orange-500 font-extrabold text-sm px-5 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 whitespace-nowrap"
      >
        <i className="fas fa-headset" />
        Get Help
        {userUnread > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shadow animate-bounce">
            {fmt(userUnread)}
          </span>
        )}
      </button>
    </div>
  </div>
);

export default SupportBanner;

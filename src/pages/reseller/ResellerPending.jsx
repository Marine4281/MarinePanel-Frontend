// src/pages/reseller/ResellerPending.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock } from "react-icons/fi";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const POLL_INTERVAL_MS = 5000;

export default function ResellerPending() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const intervalRef = useRef(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await API.get("/auth/profile");
        const freshUser = res.data;

        if (freshUser && !freshUser.resellerActivationPending) {
          // Platform fee has been settled — sync the user in context/
          // localStorage so ResellerDashboard's guard doesn't bounce
          // us right back here, then redirect.
          updateUser(freshUser);
          clearInterval(intervalRef.current);
          navigate("/reseller/dashboard");
        }
      } catch (err) {
        // Stay on this page on a transient/network error; just retry next tick
      }
    };

    checkStatus(); // check immediately on mount, don't wait for the first interval
    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, [navigate, updateUser]);

  // Tick a local clock every 30s purely to re-render the elapsed-time message —
  // separate from the status-check interval so a slow API call never delays this.
  useEffect(() => {
    const since = user?.resellerActivationPendingSince
      ? new Date(user.resellerActivationPendingSince).getTime()
      : Date.now();

    const tick = () => setElapsedMs(Date.now() - since);
    tick();
    const clockId = setInterval(tick, 30000);
    return () => clearInterval(clockId);
  }, [user?.resellerActivationPendingSince]);

  const minutes = Math.floor(elapsedMs / 60000);
  const hours = Math.floor(minutes / 60);

  let waitMessage =
    "Your panel was created but is still being finalized. This usually takes just a few minutes — we'll activate it automatically as soon as it's ready. No further action is needed from you.";

  if (hours >= 1) {
    waitMessage =
      "This is taking longer than usual — sometimes a couple of hours in rare cases. We're still working on it automatically, but if it's been a while, feel free to contact support below.";
  } else if (minutes >= 10) {
    waitMessage =
      "This can occasionally take a bit longer — up to an hour or so. No action is needed yet, but support is here if you'd like an update.";
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white shadow-lg rounded-xl p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
        <FiClock className="text-yellow-500 text-3xl" />
      </div>

      <h1 className="text-xl font-bold mb-2">Your Reseller Panel is on Pause</h1>

      <p className="text-sm text-gray-500 mb-6">{waitMessage}</p>

      <button
        onClick={() => navigate("/support")}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg mb-3"
      >
        Contact Support
      </button>

      <button
        onClick={() => navigate("/home")}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg"
      >
        Back to Home
      </button>
    </div>
  );
}

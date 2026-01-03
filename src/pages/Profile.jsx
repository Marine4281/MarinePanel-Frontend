import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axios";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState({
    email: "",
    phone: "",
    country: "",
    balance: 0,
    createdAt: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [password, setPassword] = useState("");

  // Fetch profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/users/profile");
        setProfile(res.data);
      } catch (error) {
        console.error("PROFILE ERROR:", error.response || error);
        toast.error(error.response?.data?.message || "Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const res = await API.put("/users/profile", {
        phone: profile.phone,
        country: profile.country,
        password: password || undefined,
      });

      setProfile(res.data);
      toast.success("Profile updated successfully");
      setEditMode(false);
      setPassword("");
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error.response || error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const displayName = profile.email
    ? profile.email.split("@")[0]
    : "User";

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header balance={profile.balance} />

      <main className="flex-grow max-w-3xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 pb-24">
          {/* Profile Top */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-orange-500">
              {displayName.slice(0, 2).toUpperCase()}
            </div>

            <div>
              <h2 className="text-2xl font-bold">{displayName}</h2>
              <p className="text-gray-500">User ID: #{user?._id}</p>
              <p className="text-sm text-green-600 mt-1">Active</p>
            </div>
          </div>

          <hr className="my-6" />

          {/* Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{profile.email}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Phone</label>
              {editMode ? (
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="p-2 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              ) : (
                <p className="font-medium">{profile.phone}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-500">Account Type</label>
              <p className="font-medium">User</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Country</label>
              {editMode ? (
                <input
                  type="text"
                  name="country"
                  value={profile.country}
                  onChange={handleChange}
                  className="p-2 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              ) : (
                <p className="font-medium">{profile.country}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-500">Joined</label>
              <p className="font-medium">
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>

            {editMode && (
              <div>
                <label className="text-sm text-gray-500">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-2 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            )}
          </div>

          <hr className="my-6" />

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            {editMode ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setPassword("");
                  }}
                  className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition"
                >
                  Edit Profile
                </button>
                <button
                  onClick={logout}
                  className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Profile;
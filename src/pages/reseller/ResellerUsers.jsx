// src/pages/reseller/ResellerUsers.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMenu, FiLogOut, FiArrowLeft } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ResellerUsers() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const dashRes = await API.get("/reseller/dashboard");
        setBrandName(dashRes.data.brandName);

        const usersRes = await API.get("/reseller/users");
        setUsers(usersRes.data);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load reseller users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white shadow-md p-6">

        <h1 className="text-xl font-bold text-orange-500 mb-6">
          {brandName || "Reseller Panel"}
        </h1>

        <nav className="flex flex-col gap-4">

          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-500"
          >
            <FiArrowLeft /> Back
          </button>

          <Link to="/reseller/dashboard" className="font-semibold text-gray-700 hover:text-orange-500">
            Dashboard
          </Link>

          <Link to="/reseller/users" className="font-semibold text-orange-500">
            Users
          </Link>

          <Link to="/reseller/orders" className="font-semibold text-gray-700 hover:text-orange-500">
            Orders
          </Link>

          <Link to="/reseller/branding" className="font-semibold text-gray-700 hover:text-orange-500">
            Branding
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-red-500 mt-6"
          >
            <FiLogOut /> Logout
          </button>

        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Mobile Navbar */}
        <header className="lg:hidden flex items-center justify-between bg-white p-4 shadow-md">

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-orange-500 text-2xl"
          >
            <FiMenu />
          </button>

          <h1 className="text-lg font-bold text-orange-500">
            Reseller Users
          </h1>

          <button onClick={logout}>
            <FiLogOut />
          </button>

        </header>

        {/* Mobile Sidebar */}
        {menuOpen && (
          <aside className="lg:hidden absolute z-50 bg-white shadow-md w-64 h-full p-6">

            <nav className="flex flex-col gap-4">

              <button
                onClick={() => navigate("/home")}
                className="flex items-center gap-2 text-gray-700 hover:text-orange-500"
              >
                <FiArrowLeft /> Back
              </button>

              <Link to="/reseller/dashboard">Dashboard</Link>
              <Link to="/reseller/users">Users</Link>
              <Link to="/reseller/orders">Orders</Link>
              <Link to="/reseller/branding">Branding</Link>

              <button onClick={logout} className="text-red-500">
                Logout
              </button>

            </nav>

          </aside>
        )}

        <main className="p-6 flex-1 overflow-auto">

          {loading ? (
            <div className="text-center py-20 text-gray-500">
              Loading reseller users...
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">

              <h2 className="text-lg font-bold mb-4 text-orange-500">
                All Reseller Users
              </h2>

              {users.length === 0 ? (
                <p className="text-gray-500">No users registered yet</p>
              ) : (
                <table className="w-full table-auto">

                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Joined</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b hover:bg-gray-50">

                        <td className="px-4 py-2">
                          {u.name}
                        </td>

                        <td className="px-4 py-2">
                          {u.email}
                        </td>

                        <td className="px-4 py-2">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}

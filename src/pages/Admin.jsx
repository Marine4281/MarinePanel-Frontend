// pages/Admin.jsx
export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
        <p>User management features coming soon...</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-4">Manage Services</h2>
        <p>Service management features coming soon...</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Settings</h2>
        <p>Admin settings coming soon...</p>
      </div>
    </div>
  );
}
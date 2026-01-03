const Topbar = () => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-semibold">Dashboard</h2>

      <div className="flex items-center space-x-4">
        <i className="fa-solid fa-bell text-xl text-gray-600"></i>

        <div className="flex items-center space-x-2 bg-white p-2 rounded-xl shadow">
          <img src="https://i.pravatar.cc/40" className="rounded-full w-10 h-10" />
          <span className="font-semibold text-gray-700">Admin</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
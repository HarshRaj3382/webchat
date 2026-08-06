import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">
            💬
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            WebChat
          </h1>
        </Link>

        {/* User Logged In */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Hide username on very small screens */}
            <div className="hidden sm:block text-right">
              <h3 className="font-semibold text-sm md:text-base">
                {user.username}
              </h3>

              <p className="text-xs text-green-600">
                ● Online
              </p>
            </div>

            <img
              src={
                user.profilePic
                  ? user.profilePic
                  : "https://i.pravatar.cc/150"
              }
              alt="Profile"
              className="w-10 h-10 rounded-full border object-cover"
            />

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm transition"
            >
              Logout
            </button>

          </div>
        ) : (
          <div className="flex items-center gap-2">

            <Link to="/login">
              <button className="border border-blue-600 text-blue-600 px-3 sm:px-5 py-2 rounded-lg text-sm hover:bg-blue-50 transition">
                Login
              </button>
            </Link>

            <Link to="/register">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-5 py-2 rounded-lg text-sm transition">
                Register
              </button>
            </Link>

          </div>
        )}

      </div>
    </header>
  );
};

export default Header;
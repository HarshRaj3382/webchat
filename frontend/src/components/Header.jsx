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
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            💬
          </div>

          <h1 className="text-2xl font-bold">
            WebChat
          </h1>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">

            <div className="text-right">

              <h3 className="font-semibold">
                {user.username}
              </h3>

              <p className="text-sm text-green-600">
                Online
              </p>

            </div>

            <img
              src={
                user.profilePic
                  ? user.profilePic
                  : "https://i.pravatar.cc/150"
              }
              alt=""
              className="w-11 h-11 rounded-full border object-cover"
            />

            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>

          </div>
        ) : (
          <div className="flex gap-3">

            <Link to="/login">
              <button className="border border-blue-600 px-5 py-2 rounded-lg text-blue-600">
                Login
              </button>
            </Link>

            <Link to="/register">
              <button className="bg-blue-600 text-white px-5 py-2 rounded-lg">
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
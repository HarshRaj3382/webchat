import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Compass,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  MessagesSquare,
  Search,
  X,
} from "lucide-react";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const Header = ({ onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = getStoredUser();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const enableNotifications = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="WebChat home">
          <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200 transition-transform group-hover:-rotate-3 group-hover:scale-105">
            <MessageCircle size={21} strokeWidth={2.4} />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Web<span className="text-indigo-600">Chat</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          <Link
            to="/"
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${location.pathname === "/" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            <Home size={17} /> Home
          </Link>
          <Link
            to="/messages"
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${location.pathname === "/messages" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            <MessagesSquare size={17} /> Messages
          </Link>
          <a
            href="#discover"
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Compass size={17} /> Discover
          </a>
        </nav>

        {onSearch ? <label className="relative mx-auto hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="search"
            placeholder="Search conversations..."
            aria-label="Search conversations"
            onChange={(event) => onSearch?.(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
        </label> : <div className="flex-1" />}

        {user ? (
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={enableNotifications}
              aria-label="Notifications"
              title="Enable browser notifications for incoming calls"
              className="relative hidden size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 sm:grid"
            >
              <Bell size={19} />
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-rose-500" />
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="hidden items-center gap-2.5 sm:flex">
              <img
                src={user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || "User")}&background=4f46e5&color=fff`}
                alt=""
                className="size-9 rounded-xl object-cover ring-2 ring-slate-100"
              />
              <div className="hidden leading-tight xl:block">
                <p className="max-w-28 truncate text-sm font-semibold text-slate-800">{user.username}</p>
                <p className="text-[11px] font-medium text-emerald-600">Online now</p>
              </div>
              <ChevronDown className="hidden text-slate-400 xl:block" size={16} />
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              aria-label="Open user menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={19} /> : <Menu size={20} />}
            </button>

            {menuOpen && (
              <div className="absolute right-4 top-[calc(100%+0.5rem)] w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70 sm:right-6 lg:right-8">
                <div className="border-b border-slate-100 px-3 py-2.5 sm:hidden">
                  <p className="truncate text-sm font-semibold text-slate-800">{user.username}</p>
                  <p className="text-xs text-emerald-600">Online now</p>
                </div>
                <a href="#discover" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 lg:hidden">
                  <Compass size={17} /> Discover
                </a>
                <Link to="/messages" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 lg:hidden">
                  <MessagesSquare size={17} /> Messages
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut size={17} /> Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="ml-auto flex items-center gap-2">
            <Link to="/login" className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Log in
            </Link>
            <Link to="/register" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700">
              Join now
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, MessageCircle, Sparkles } from "lucide-react";
import API from "../api/authApi";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await API.post("/auth/login", formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Login failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-24 top-1/3 size-80 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-violet-500/20 blur-3xl" />
        <Link to="/login" className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-950"><MessageCircle size={22} /></span>
          <span className="text-xl font-extrabold tracking-tight">WebChat</span>
        </Link>

        <div className="relative max-w-lg">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-indigo-200">
            <Sparkles size={14} /> Ideas are better together
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">Pick up the conversations that matter to you.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-300">Share what you are building, learn from your community, and find a fresh perspective every day.</p>
        </div>

        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} WebChat community</p>
      </section>

      <section className="flex items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.09),transparent_24rem)] px-5 py-10 sm:px-8">
        <div className="w-full max-w-md animate-fade-up">
          <Link to="/login" className="mb-10 flex items-center gap-2.5 lg:hidden">
            <span className="grid size-10 place-items-center rounded-2xl bg-indigo-600 text-white"><MessageCircle size={20} /></span>
            <span className="text-xl font-extrabold text-slate-900">Web<span className="text-indigo-600">Chat</span></span>
          </Link>

          <p className="text-sm font-bold text-indigo-600">WELCOME BACK</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Sign in to your account</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Your community has been busy. Let’s get you caught up.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(event) => setFormData((data) => ({ ...data, email: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="login-password" className="text-sm font-semibold text-slate-700">Password</label>
                <span className="text-xs font-semibold text-indigo-600">At least 6 characters</span>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(event) => setFormData((data) => ({ ...data, password: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
                <button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:translate-y-0 disabled:opacity-60">
              {loading ? <><Loader2 className="animate-spin" size={18} /> Signing in...</> : <>Sign in <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">New to WebChat? <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700">Create an account</Link></p>
        </div>
      </section>
    </main>
  );
};

export default Login;

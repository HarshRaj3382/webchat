import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Camera, Eye, EyeOff, Loader2, Lock, Mail, MessageCircle, Sparkles, User } from "lucide-react";
import API from "../api/authApi";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [formData, setFormData] = useState({ username: "", email: "", password: "", profilePic: "" });

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setFormData((data) => ({ ...data, profilePic: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/register", formData);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: "register-name", name: "username", label: "Username", type: "text", placeholder: "How people will know you", icon: User, autoComplete: "username" },
    { id: "register-email", name: "email", label: "Email address", type: "email", placeholder: "you@example.com", icon: Mail, autoComplete: "email" },
  ];

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-24 top-1/3 size-80 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-violet-500/20 blur-3xl" />
        <Link to="/register" className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600"><MessageCircle size={22} /></span>
          <span className="text-xl font-extrabold tracking-tight">WebChat</span>
        </Link>
        <div className="relative max-w-lg">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-indigo-200"><Sparkles size={14} /> Your voice belongs here</div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">Find your people. Share your perspective.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-300">Join a growing community of curious minds, makers, and lifelong learners.</p>
        </div>
        <p className="relative text-xs text-slate-500">A kinder corner of the internet.</p>
      </section>

      <section className="flex items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.09),transparent_24rem)] px-5 py-10 sm:px-8">
        <div className="w-full max-w-md animate-fade-up">
          <Link to="/register" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid size-10 place-items-center rounded-2xl bg-indigo-600 text-white"><MessageCircle size={20} /></span>
            <span className="text-xl font-extrabold text-slate-900">Web<span className="text-indigo-600">Chat</span></span>
          </Link>
          <p className="text-sm font-bold text-indigo-600">JOIN THE COMMUNITY</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Create your account</h2>
          <p className="mt-3 text-sm text-slate-500">It only takes a minute to start sharing.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3">
              <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-indigo-50 text-indigo-500">
                {preview ? <img src={preview} alt="Profile preview" className="size-full object-cover" /> : <User size={24} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700">Profile photo</p>
                <p className="mt-0.5 text-xs text-slate-400">Optional · JPG or PNG</p>
              </div>
              <label className="grid size-10 cursor-pointer place-items-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600">
                <Camera size={18} /><span className="sr-only">Upload profile photo</span>
                <input type="file" className="sr-only" accept="image/*" onChange={handleImage} />
              </label>
            </div>

            {fields.map(({ id, name, label, type, placeholder, icon: Icon, autoComplete }) => (
              <div key={name}>
                <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
                <div className="relative">
                  <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input id={id} name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} required value={formData[name]} onChange={(event) => setFormData((data) => ({ ...data, [name]: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
                </div>
              </div>
            ))}

            <div>
              <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input id="register-password" type={showPassword ? "text" : "password"} name="password" placeholder="At least 6 characters" autoComplete="new-password" required minLength={6} value={formData.password} onChange={(event) => setFormData((data) => ({ ...data, password: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
                <button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>

            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:translate-y-0 disabled:opacity-60">
              {loading ? <><Loader2 className="animate-spin" size={18} /> Creating account...</> : <>Create account <ArrowRight size={18} /></>}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">Already a member? <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
};

export default Register;

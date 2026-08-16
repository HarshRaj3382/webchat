import { ArrowUp, Heart, Mail, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white sm:mt-16">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-9 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="WebChat home">
              <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-100">
                <MessageCircle size={20} />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">Web<span className="text-indigo-600">Chat</span></span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
              A welcoming space to share ideas, discover fresh perspectives, and make every conversation count.
            </p>
            <a href="mailto:contact@webchat.com" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600">
              <Mail size={16} /> contact@webchat.com
            </a>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">Explore</h2>
            <nav className="mt-4 grid gap-3 text-sm text-slate-500" aria-label="Footer navigation">
              <Link to="/" className="transition hover:text-indigo-600">Home feed</Link>
              <a href="#discover" className="transition hover:text-indigo-600">Discover topics</a>
              <a href="#feed" className="transition hover:text-indigo-600">Latest posts</a>
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">Community</h2>
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-indigo-50 p-3.5">
              <Sparkles className="mt-0.5 shrink-0 text-indigo-600" size={17} />
              <p className="text-xs leading-5 text-indigo-900/70">Be curious, be constructive, and make space for every voice.</p>
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} WebChat. Made for meaningful conversations.</p>
          <div className="flex items-center gap-1.5">Built with <Heart size={13} className="fill-rose-500 text-rose-500" /> for the community</div>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToTop}
        className="fixed bottom-5 right-5 z-40 grid size-11 place-items-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-300 transition hover:-translate-y-1 hover:bg-indigo-600 sm:bottom-6 sm:right-6"
        aria-label="Back to top"
      >
        <ArrowUp size={18} />
      </button>
    </footer>
  );
};

export default Footer;

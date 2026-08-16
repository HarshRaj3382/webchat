import { useState } from "react";
import { Bookmark, Compass, Hash, MessageSquareText, Sparkles, Users } from "lucide-react";
import Header from "../components/Header";
import CreatePost from "../components/CreatePost";
import PostList from "../components/PostList";
import Footer from "../components/Footer";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const Home = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const user = getStoredUser();
  const username = user?.username || "there";

  return (
    <div className="min-h-screen text-slate-800">
      <Header onSearch={setSearchQuery} />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[220px_minmax(0,640px)] lg:justify-center lg:px-8 lg:py-9 xl:grid-cols-[220px_minmax(0,640px)_260px] xl:justify-normal">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            <section className="soft-card overflow-hidden rounded-3xl p-4">
              <div className="h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-400" />
              <img
                src={user?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=4f46e5&color=fff`}
                alt=""
                className="-mt-7 ml-3 size-14 rounded-2xl border-4 border-white object-cover shadow-sm"
              />
              <div className="px-2 pb-2 pt-3">
                <p className="truncate font-bold text-slate-900">{username}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Sharing ideas, one conversation at a time.</p>
              </div>
            </section>

            <nav className="space-y-1" aria-label="Feed navigation">
              {[
                [MessageSquareText, "Your feed", "#feed"],
                [Compass, "Explore", "#discover"],
                [Users, "Communities", "#communities"],
                [Bookmark, "Saved posts", "#saved"],
              ].map(([Icon, label, href], index) => (
                <a
                  key={label}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${index === 0 ? "bg-indigo-50 font-semibold text-indigo-700" : "font-medium text-slate-500 hover:bg-white hover:text-slate-900"}`}
                >
                  <Icon size={18} /> {label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <section id="feed" className="min-w-0">
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
              <Sparkles size={16} /> Your daily mix
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Good to see you, {username}.
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">Catch up, share something new, and join the conversation.</p>
          </div>

          <CreatePost onPostCreated={() => setRefreshKey((key) => key + 1)} />
          <PostList refreshKey={refreshKey} searchQuery={searchQuery} />
        </section>

        <aside id="discover" className="hidden xl:block">
          <div className="sticky top-24 space-y-5">
            <section className="soft-card rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Trending topics</h2>
                <Hash className="text-indigo-500" size={18} />
              </div>
              <div className="mt-4 space-y-1">
                {[
                  ["webdevelopment", "2.4k posts"],
                  ["reactjs", "1.8k posts"],
                  ["buildinpublic", "986 posts"],
                  ["mernstack", "742 posts"],
                ].map(([topic, count]) => (
                  <a key={topic} href="#feed" className="group block rounded-2xl px-3 py-2.5 transition hover:bg-indigo-50">
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700">#{topic}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{count}</p>
                  </a>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-slate-900 p-5 text-white shadow-xl shadow-slate-200">
              <div className="grid size-9 place-items-center rounded-xl bg-white/10">
                <Sparkles size={18} className="text-amber-300" />
              </div>
              <h2 className="mt-4 font-bold">Make your feed yours</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">Follow topics and join conversations that spark your curiosity.</p>
              <a href="#feed" className="mt-4 inline-flex text-sm font-semibold text-indigo-300 hover:text-white">Explore your feed →</a>
            </section>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
};

export default Home;

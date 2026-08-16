import { useCallback, useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import PostApi from "../api/postApi";
import PostCard from "./PostCard";
import demoPosts from "../data/posts";

const DEFAULT_PROFILE = "https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff";

const PostList = ({ refreshKey, searchQuery = "" }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await PostApi.fetchPosts();
      const backendPosts = (response.data.posts || []).map((post) => ({
        ...post,
        user: post.user || { username: "Anonymous", profilePic: DEFAULT_PROFILE },
        likes: post.likes || [],
        comments: post.comments || [],
      }));
      setPosts([...backendPosts, ...demoPosts]);
    } catch (error) {
      console.error(error);
      setPosts(demoPosts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const requestId = window.setTimeout(fetchPosts, 0);

    return () => window.clearTimeout(requestId);
  }, [fetchPosts, refreshKey]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visiblePosts = normalizedQuery
    ? posts.filter((post) => {
        const author = post.user?.username || post.username || "";
        return `${author} ${post.content || ""}`.toLowerCase().includes(normalizedQuery);
      })
    : posts;

  return (
    <section className="mt-7" aria-label="Recent posts">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-900">Latest conversations</h2>
          <p className="mt-0.5 text-xs text-slate-400">Fresh from your community</p>
        </div>
        <button type="button" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600">
          <SlidersHorizontal size={15} /> Latest
        </button>
      </div>

      <div className="space-y-5">
        {loading
          ? [0, 1].map((item) => (
              <div key={item} className="soft-card animate-pulse rounded-3xl p-5">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-slate-200" />
                  <div className="space-y-2"><div className="h-3 w-28 rounded bg-slate-200" /><div className="h-2.5 w-20 rounded bg-slate-100" /></div>
                </div>
                <div className="mt-5 space-y-2"><div className="h-3 rounded bg-slate-100" /><div className="h-3 w-4/5 rounded bg-slate-100" /></div>
              </div>
            ))
          : visiblePosts.map((post, index) => (
              <PostCard key={post._id || post.id || index} post={post} onCommentAdded={fetchPosts} />
            ))}
        {!loading && visiblePosts.length === 0 && (
          <div className="soft-card rounded-3xl px-6 py-12 text-center">
            <p className="font-bold text-slate-800">No conversations found</p>
            <p className="mt-2 text-sm text-slate-400">Try a different author, topic, or keyword.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PostList;

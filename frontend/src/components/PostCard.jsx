import { useState } from "react";
import {
  BadgeCheck,
  Check,
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
} from "lucide-react";
import PostApi from "../api/postApi";

const DEFAULT_PROFILE = "https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const formatPostDate = (value) => {
  if (!value) return "Just now";
  if (typeof value === "string" && !/^\d{4}-\d{2}-\d{2}/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const PostCard = ({ post, onCommentAdded }) => {
  const username = post.user?.username || post.username || "Anonymous";
  const profilePic = post.user?.profilePic || post.profilePic || DEFAULT_PROFILE;
  const initialLikes = Array.isArray(post.likes) ? post.likes.length : Number(post.likes) || 0;
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [commentLoading, setCommentLoading] = useState(false);
  const [shared, setShared] = useState(false);

  const handleLike = async () => {
    if (!post._id) {
      setLiked((current) => !current);
      setLikeCount((count) => (liked ? Math.max(count - 1, 0) : count + 1));
      return;
    }

    try {
      const response = await PostApi.likePost(post._id);
      const isNowLiked = response.data.message === "Post Liked";
      setLiked(isNowLiked);
      setLikeCount((count) => Math.max(count + (isNowLiked ? 1 : -1), 0));
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async () => {
    const comment = commentText.trim();
    if (!comment) return;

    if (!post._id) {
      const currentUser = getStoredUser();
      setComments((items) => [
        ...items,
        {
          _id: `local-${Date.now()}`,
          comment,
          createdAt: new Date().toISOString(),
          user: currentUser || { username: "You", profilePic: DEFAULT_PROFILE },
        },
      ]);
      setCommentText("");
      return;
    }

    try {
      setCommentLoading(true);
      const response = await PostApi.addComment(post._id, comment);
      setComments(response.data.post.comments || []);
      setCommentText("");
      onCommentAdded?.();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "We couldn't add your comment. Please try again.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = { title: `${username} on WebChat`, text: post.content || "Take a look at this post", url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch (error) {
      if (error.name !== "AbortError") console.error(error);
    }
  };

  const commentCount = post.commentsCount ?? comments.length;

  return (
    <article className="soft-card animate-fade-up overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60">
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <img
            src={profilePic}
            alt={`${username}'s profile`}
            className="size-11 rounded-xl object-cover ring-2 ring-slate-100"
            onError={(event) => { event.currentTarget.src = DEFAULT_PROFILE; }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-bold text-slate-900 sm:text-[15px]">{username}</h3>
              <BadgeCheck size={16} className="shrink-0 fill-indigo-500 text-white" />
            </div>
            <p className="mt-0.5 text-xs text-slate-400">{formatPostDate(post.createdAt)} · Public</p>
          </div>
          <button type="button" aria-label="More post options" className="grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {post.content && <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{post.content}</p>}
      </div>

      {post.image && (
        <div className="border-y border-slate-100 bg-slate-50">
          <img src={post.image} alt={`Shared by ${username}`} className="max-h-[34rem] w-full object-cover" />
        </div>
      )}

      <div className="px-4 pb-3 sm:px-5">
        <div className="flex items-center justify-between border-b border-slate-100 py-3 text-xs text-slate-400">
          <span>{likeCount > 0 ? `${likeCount} ${likeCount === 1 ? "like" : "likes"}` : "Be the first to like"}</span>
          <span>{commentCount > 0 ? `${commentCount} ${commentCount === 1 ? "comment" : "comments"}` : "Start a conversation"}</span>
        </div>

        <div className="grid grid-cols-3 gap-1 pt-2">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${liked ? "bg-rose-50 text-rose-600" : "text-slate-500 hover:bg-slate-50 hover:text-rose-600"}`}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} /> <span className="hidden sm:inline">Like</span>
          </button>
          <button
            type="button"
            onClick={() => setCommentVisible((visible) => !visible)}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${commentVisible ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"}`}
          >
            <MessageCircle size={18} /> <span className="hidden sm:inline">Comment</span>
          </button>
          <button type="button" onClick={handleShare} className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-emerald-600">
            {shared ? <Check size={18} /> : <Share2 size={18} />} <span className="hidden sm:inline">{shared ? "Copied" : "Share"}</span>
          </button>
        </div>

        {commentVisible && (
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-end gap-2">
              <textarea
                rows="1"
                placeholder="Add to the conversation..."
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleCommentSubmit();
                  }
                }}
                className="min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={handleCommentSubmit}
                disabled={commentLoading || !commentText.trim()}
                aria-label="Post comment"
                className="grid size-11 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40"
              >
                {commentLoading ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {comments.map((item, index) => (
                <div key={item._id || index} className="flex items-start gap-2.5">
                  <img
                    src={item.user?.profilePic || DEFAULT_PROFILE}
                    alt=""
                    className="size-8 rounded-lg object-cover"
                    onError={(event) => { event.currentTarget.src = DEFAULT_PROFILE; }}
                  />
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-slate-50 px-3.5 py-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-800">{item.user?.username || "Anonymous"}</p>
                      <p className="text-[10px] text-slate-400">{formatPostDate(item.createdAt)}</p>
                    </div>
                    <p className="mt-1 break-words text-sm leading-5 text-slate-600">{item.comment}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="py-1 text-center text-xs text-slate-400">No comments yet. Start the conversation.</p>}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;

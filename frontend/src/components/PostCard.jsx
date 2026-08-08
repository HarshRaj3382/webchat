import { useState } from "react";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import PostApi from "../api/postApi";

const DEFAULT_PROFILE =
  "https://ui-avatars.com/api/?name=User&background=2563eb&color=fff";

const PostCard = ({ post, onCommentAdded }) => {
  const username = post.user?.username || post.username || "Anonymous";

  const profilePic =
    post.user?.profilePic ||
    post.profilePic ||
    DEFAULT_PROFILE;

  const createdAt = post.createdAt
    ? new Date(post.createdAt)
    : new Date();

  const initialLikes = Array.isArray(post.likes)
    ? post.likes.length
    : post.likes || 0;

  const [likeCount, setLikeCount] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [commentLoading, setCommentLoading] = useState(false);

  // Like / Unlike
  const handleLike = async () => {
    try {
      const res = await PostApi.likePost(post._id);

      if (res.data.message === "Post Liked") {
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      } else {
        setLiked(false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (error) {
      console.log(error);
      alert("Failed to like post");
    }
  };

  const handleToggleComment = () => {
    setCommentVisible((prev) => !prev);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      return alert("Please write a comment");
    }

    try {
      setCommentLoading(true);
      const res = await PostApi.addComment(post._id, commentText.trim());

      setComments(res.data.post.comments || []);
      setCommentText("");
      setCommentVisible(true);

      if (typeof onCommentAdded === "function") {
        onCommentAdded();
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-5">

      {/* Header */}
      <div className="flex items-center gap-3">

        <img
          src={profilePic}
          alt={username}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            e.target.src = DEFAULT_PROFILE;
          }}
        />

        <div>
          <h2 className="font-semibold text-gray-800">
            {username}
          </h2>

          <p className="text-sm text-gray-500">
            {createdAt.toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </div>

      </div>

      {post.content && (
        <p className="mt-4 text-gray-700 leading-7">{post.content}</p>
      )}

      {post.image && (
        <div className="mt-4">
          <img
            src={post.image}
            alt="Post"
            className="w-full rounded-xl object-cover max-h-96"
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t">

        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition ${
            liked
              ? "text-red-500"
              : "text-gray-600 hover:text-red-500"
          }`}
        >
          <Heart
            size={20}
            fill={liked ? "red" : "none"}
          />
          {likeCount}
        </button>

        <button
          onClick={handleToggleComment}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
        >
          <MessageCircle size={20} />
          {post.commentsCount || comments.length} Comments
        </button>

        <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition">
          <Share2 size={20} />
          Share
        </button>
      </div>

      {commentVisible && (
        <div className="mt-4 space-y-4">
          <div className="space-y-3">
            <textarea
              rows="3"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full border rounded-lg p-3 resize-none outline-blue-500"
            />
            <button
              type="button"
              onClick={handleCommentSubmit}
              disabled={commentLoading}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={16} />
              {commentLoading ? "Posting..." : "Post Comment"}
            </button>
          </div>

          <div className="space-y-3">
            {comments.length > 0 ? (
              comments.map((commentItem) => (
                <div
                  key={commentItem._id}
                  className="rounded-2xl border border-gray-200 p-4 bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={commentItem.user?.profilePic || DEFAULT_PROFILE}
                      alt={commentItem.user?.username || "Anonymous"}
                      className="w-9 h-9 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = DEFAULT_PROFILE;
                      }}
                    />
                    <div>
                      <p className="font-semibold text-sm text-gray-800">
                        {commentItem.user?.username || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(commentItem.createdAt).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-700">{commentItem.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No comments yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
import { useState } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import API from "../api/authApi";

const DEFAULT_PROFILE =
  "https://ui-avatars.com/api/?name=User&background=2563eb&color=fff";

const PostCard = ({ post }) => {
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

  // Like / Unlike
  const handleLike = async () => {
    try {
      const res = await API.put(`/posts/${post._id}/like`);

      if (res.data.message === "Post Liked") {
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      } else {
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to like post");
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

      {/* Content */}
      <p className="mt-4 text-gray-700 leading-7">
        {post.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t">

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

        {/* Comment */}
        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
          <MessageCircle size={20} />
          Comment
        </button>

        {/* Share */}
        <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition">
          <Share2 size={20} />
          Share
        </button>

      </div>

    </div>
  );
};

export default PostCard;
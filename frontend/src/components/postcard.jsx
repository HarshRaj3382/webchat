import { Heart, MessageCircle, Share2 } from "lucide-react";

const DEFAULT_PROFILE =
  "https://ui-avatars.com/api/?name=User&background=2563eb&color=fff&size=200";

const PostCard = ({ post }) => {
  const username = post.user?.username || "Anonymous";

  const profilePic =
    post.user?.profilePic && post.user.profilePic !== ""
      ? post.user.profilePic
      : DEFAULT_PROFILE;

  const likes = Array.isArray(post.likes)
    ? post.likes.length
    : post.likes || 0;

  const createdAt = new Date(post.createdAt).toLocaleString();

  return (
    <div className="bg-white rounded-xl shadow-md p-5">

      {/* Header */}
      <div className="flex items-center gap-3">

        <img
          src={profilePic}
          alt={username}
          className="w-12 h-12 rounded-full object-cover"
        />

        <div>
          <h2 className="font-semibold text-gray-800">
            {username}
          </h2>

          <p className="text-sm text-gray-500">
            {createdAt}
          </p>
        </div>

      </div>

      {/* Content */}
      <p className="mt-4 text-gray-700 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Footer */}
      <div className="flex justify-between items-center mt-5 pt-4 border-t">

        <button className="flex items-center gap-2 text-gray-600 hover:text-red-500">
          <Heart size={20} />
          {likes}
        </button>

        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
          <MessageCircle size={20} />
          Comment
        </button>

        <button className="flex items-center gap-2 text-gray-600 hover:text-green-600">
          <Share2 size={20} />
          Share
        </button>

      </div>

    </div>
  );
};

export default PostCard;
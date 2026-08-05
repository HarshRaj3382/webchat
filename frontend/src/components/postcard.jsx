import { Heart, MessageCircle } from "lucide-react";

const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-5">

      <div className="flex items-center gap-3">

        <img
          src={post.profilePic}
          alt=""
          className="w-12 h-12 rounded-full object-cover"
        />

        <div>

          <h2 className="font-semibold">
            {post.username}
          </h2>

          <p className="text-sm text-gray-500">
            {post.createdAt}
          </p>

        </div>

      </div>

      <p className="mt-4 text-gray-700">
        {post.content}
      </p>

      <div className="flex gap-8 mt-5 text-gray-600">

        <button className="flex items-center gap-2 hover:text-red-500">
          <Heart size={20} />
          {post.likes}
        </button>

        <button className="flex items-center gap-2 hover:text-blue-600">
          <MessageCircle size={20} />
          {post.comments}
        </button>

      </div>

    </div>
  );
};

export default PostCard;
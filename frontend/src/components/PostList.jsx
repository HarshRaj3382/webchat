import { useEffect, useState } from "react";
import PostApi from "../api/postApi";
import PostCard from "./PostCard";
import demoPosts from "../data/posts";

const DEFAULT_PROFILE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVVGo-nXbvk4li-Z3T2a0jKO5xsnhXx7JJ8FYoQEUhyND2QeSlHd3Yhtw&s";

const PostList = ({ refreshKey }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, [refreshKey]);

  const fetchPosts = async () => {
    try {
      const res = await PostApi.fetchPosts();

      const backendPosts = res.data.posts.map((post) => ({
        ...post,
        user: post.user || { username: "Anonymous", profilePic: DEFAULT_PROFILE },
        likes: post.likes || [],
        comments: post.comments || [],
      }));

      setPosts([...backendPosts, ...demoPosts]);
    } catch (error) {
      console.log(error);
      setPosts(demoPosts);
    }
  };

  const handleCommentAdded = () => {
    fetchPosts();
  };

  return (
    <div className="space-y-5 mt-5">
      {posts.map((post, index) => (
        <PostCard
          key={post._id || post.id || index}
          post={post}
          onCommentAdded={handleCommentAdded}
        />
      ))}
    </div>
  );
};

export default PostList;
import { useEffect, useState } from "react";
import API from "../api/authApi";
import PostCard from "./PostCard";
import demoPosts from "../data/posts";

const DEFAULT_PROFILE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVVGo-nXbvk4li-Z3T2a0jKO5xsnhXx7JJ8FYoQEUhyND2QeSlHd3Yhtw&s";

const PostList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");

      const backendPosts = res.data.posts.map((post) => ({
        _id: post._id,
        username: post.user?.username || "Anonymous",
        profilePic: post.user?.profilePic || DEFAULT_PROFILE,
        content: post.content,
        createdAt: post.createdAt,
        likes: post.likes || [],
      }));

      setPosts([...backendPosts, ...demoPosts]);

    } catch (error) {
      console.log(error);
      setPosts(demoPosts);
    }
  };

  return (
    <div className="space-y-5 mt-5">
      {posts.map((post, index) => (
        <PostCard
          key={post._id || post.id || index}
          post={post}
        />
      ))}
    </div>
  );
};

export default PostList;
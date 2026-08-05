import { useEffect, useState } from "react";
import API from "../api/authApi";
import PostCard from "./PostCard";
import demoPosts from "../data/posts";

const PostList = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");

      // MongoDB posts first, demo posts after
      setPosts([...res.data.posts, ...demoPosts]);
    } catch (error) {
      console.log(error);

      // If backend fails, still show demo posts
      setPosts(demoPosts);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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
import { useState } from "react";
import API from "../api/authApi";

const CreatePost = () => {
  const [content, setContent] = useState("");

  const handlePost = async () => {
    if (!content.trim()) {
      return alert("Please write something");
    }

    try {
      const token = localStorage.getItem("token");

      const res = await API.post(
        "/posts/create",
        {
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message);

      setContent("");

    } catch (err) {
      console.log(err);

      alert(err.response?.data?.message || "Failed to create post");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-5">

      <textarea
        rows="4"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border rounded-lg p-3 resize-none outline-blue-500"
      />

      <button
        onClick={handlePost}
        className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
      >
        Post
      </button>

    </div>
  );
};

export default CreatePost;
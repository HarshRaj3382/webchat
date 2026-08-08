import { useState } from "react";
import PostApi from "../api/postApi";

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim() && !image) {
      return alert("Please write something or upload an image");
    }

    const formData = new FormData();
    formData.append("content", content.trim());

    if (image) {
      formData.append("image", image);
    }

    try {
      setLoading(true);
      const res = await PostApi.createPost(formData);

      alert(res.data.message);
      setContent("");
      setImage(null);
      if (typeof onPostCreated === "function") {
        onPostCreated();
      }
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
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

      <div className="mt-4 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Add an image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0] || null)}
          className="w-full text-sm text-gray-600"
        />

        {image && (
          <p className="text-sm text-gray-500">
            Selected file: {image.name}
          </p>
        )}
      </div>

      <button
        onClick={handlePost}
        disabled={loading}
        className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
};

export default CreatePost;
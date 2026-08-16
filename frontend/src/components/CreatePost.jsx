import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Loader2, Send, Smile, X } from "lucide-react";
import PostApi from "../api/postApi";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = getStoredUser();
  const previewUrl = useMemo(() => (image ? URL.createObjectURL(image) : ""), [image]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handlePost = async () => {
    if (!content.trim() && !image) return;

    const formData = new FormData();
    formData.append("content", content.trim());
    if (image) formData.append("image", image);

    try {
      setLoading(true);
      await PostApi.createPost(formData);
      setContent("");
      setImage(null);
      onPostCreated?.();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "We couldn't publish your post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="soft-card animate-fade-up rounded-3xl p-4 sm:p-5" aria-label="Create a post">
      <div className="flex items-start gap-3">
        <img
          src={user?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "User")}&background=4f46e5&color=fff`}
          alt=""
          className="size-10 shrink-0 rounded-xl object-cover ring-2 ring-slate-100 sm:size-11"
        />
        <div className="min-w-0 flex-1">
          <textarea
            rows="3"
            maxLength={500}
            placeholder={`What's on your mind, ${user?.username || "friend"}?`}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="min-h-24 w-full resize-none border-0 bg-transparent px-1 py-2 text-[15px] leading-6 text-slate-800 outline-none placeholder:text-slate-400 sm:text-base"
          />

          {previewUrl && (
            <div className="relative mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img src={previewUrl} alt="Selected upload preview" className="max-h-72 w-full object-cover" />
              <button
                type="button"
                onClick={() => setImage(null)}
                aria-label="Remove selected image"
                className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-slate-950/75 text-white backdrop-blur transition hover:bg-slate-950"
              >
                <X size={17} />
              </button>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 sm:px-3">
                <ImagePlus size={19} />
                <span className="hidden sm:inline">Photo</span>
                <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} className="sr-only" />
              </label>
              <span className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 sm:flex">
                <Smile size={19} /> Feeling
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-slate-400 sm:inline">{content.length}/500</span>
              <button
                type="button"
                onClick={handlePost}
                disabled={loading || (!content.trim() && !image)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:translate-y-0 disabled:opacity-40"
              >
                {loading ? <Loader2 className="animate-spin" size={17} /> : <Send size={16} />}
                {loading ? "Posting" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatePost;

import API from "./authApi";

const PostApi = {
  createPost: (formData) => API.post("posts/create", formData),
  likePost: (postId) => API.put(`posts/${postId}/like`),
  addComment: (postId, comment) => API.post(`posts/${postId}/comment`, { comment }),
  fetchPosts: () => API.get("posts"),
};

export default PostApi;

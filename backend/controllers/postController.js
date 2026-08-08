import Post from "../models/Post.js";

// Create Post
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim() && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Post must contain text or an image",
      });
    }

    const createdPost = await Post.create({
      user: req.user._id,
      content: content ? content.trim() : "",
      image: req.file ? req.file.path : "",
    });

    const post = await Post.findById(createdPost._id)
      .populate("user", "username profilePic")
      .populate("comments.user", "username profilePic");

    res.status(201).json({
      success: true,
      message: "Post Created Successfully",
      post,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Posts
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePic")
      .populate("comments.user", "username profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Like / Unlike Post
export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    await post.populate("user", "username profilePic");

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Post Unliked" : "Post Liked",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add Comment
export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { comment } = req.body;

    if (!comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.comments.push({
      user: req.user._id,
      comment: comment.trim(),
    });
    post.commentsCount = post.comments.length;

    await post.save();

    await post.populate("user", "username profilePic");
    await post.populate("comments.user", "username profilePic");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
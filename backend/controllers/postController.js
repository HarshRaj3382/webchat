import Post from "../models/Post.js";

// Create Post
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    // Validation
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    // Create Post
    const createdPost = await Post.create({
      user: req.user._id,
      content,
    });

    // Populate User Details
    const post = await Post.findById(createdPost._id).populate(
      "user",
      "username profilePic"
    );

    // Response
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
    // Post ID
    const postId = req.params.id;

    // Logged In User ID
    const userId = req.user._id;

    // Find Post
    const post = await Post.findById(postId);

    // Check Post
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Already Liked?
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike
      post.likes.pull(userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    // Save Changes
    await post.save();

    // Populate User
    await post.populate("user", "username profilePic");

    // Response
    res.status(200).json({
      success: true,
      message: alreadyLiked
        ? "Post Unliked"
        : "Post Liked",
      post,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Register
export const registerUser = async (req, res) => {
  try {
    // Data
    const { username, email, password, profilePic } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Email Check
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Password Hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // New User
    const user = new User({
      username,
      email,
      password: hashedPassword,
      profilePic,
    });

    // Save User
    await user.save();

    // Response
    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
      },
    });

  } catch (error) {
    // Server Error
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    // Data
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // Find User
    const user = await User.findOne({ email });

    // User Check
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Password Check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    // Generate Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Response
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
      },
    });

  } catch (error) {
    // Server Error
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
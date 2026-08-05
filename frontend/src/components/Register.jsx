import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/authApi";
import {
  User,
  Mail,
  Lock,
  Camera,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    profilePic: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result);

      setFormData((prev) => ({
        ...prev,
        profilePic: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);

  try {
    // Register API
    const res = await API.post("/auth/register", formData);

    console.log(res.data);

    alert(res.data.message);

    // Form Reset
    setFormData({
      username: "",
      email: "",
      password: "",
      profilePic: "",
    });

    setPreview("");

    // Redirect
    navigate("/login");

  } catch (err) {
    console.log(err);

    alert(
      err.response?.data?.message || "Something went wrong"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center text-blue-600">
          WebChat
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Create your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 mt-8">

          <div className="flex justify-center">
            <div className="relative">

              <div className="w-24 h-24 rounded-full border overflow-hidden bg-gray-100 flex items-center justify-center">

                {preview ? (
                  <img
                    src={preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-gray-400" />
                )}

              </div>

              <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer">

                <Camera className="text-white" size={16} />

                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImage}
                />

              </label>

            </div>
          </div>

          <div className="relative">

            <User
              className="absolute left-3 top-3 text-gray-400"
              size={20}
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full border rounded-lg py-3 pl-10 outline-blue-500"
            />

          </div>

          <div className="relative">

            <Mail
              className="absolute left-3 top-3 text-gray-400"
              size={20}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg py-3 pl-10 outline-blue-500"
            />

          </div>

          <div className="relative">

            <Lock
              className="absolute left-3 top-3 text-gray-400"
              size={20}
            />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded-lg py-3 pl-10 pr-10 outline-blue-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>

          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>

        </form>

        <p className="text-center mt-6 text-gray-600">

          Already have an account?

          <Link
            to="/login"
            className="text-blue-600 font-semibold ml-2"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
};

export default Register;
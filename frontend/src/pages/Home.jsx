import { useState } from "react";
import Header from "../components/Header";
import CreatePost from "../components/CreatePost";
import PostList from "../components/PostList";
const Home = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-100 py-10">

        <div className="max-w-2xl mx-auto">

          <CreatePost onPostCreated={handlePostCreated} />
          <PostList refreshKey={refreshKey} />
        </div>

      </main>
    </>
  );
};

export default Home;
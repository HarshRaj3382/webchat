import Header from "../components/Header";
import CreatePost from "../components/CreatePost";

const Home = () => {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-100 py-10">

        <div className="max-w-2xl mx-auto">

          <CreatePost />

        </div>

      </main>
    </>
  );
};

export default Home;
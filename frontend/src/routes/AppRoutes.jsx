import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Register from "../components/Register";
import Login from "../components/Login";
import ProtectedRoute from "../components/ProtectedRoute";
import GlobalIncomingCallListener from "../components/GlobalIncomingCallListener";

const Messenger = lazy(() => import("../pages/Messenger"));

const MessengerPage = () => (
  <Suspense
    fallback={
      <div className="grid min-h-screen place-items-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto size-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="mt-3 text-sm font-semibold text-slate-500">Opening messages...</p>
        </div>
      </div>
    }
  >
    <Messenger />
  </Suspense>
);

const AppRoutes = () => {
  return (
    <>
      <GlobalIncomingCallListener />
      <Routes>

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MessengerPage />
          </ProtectedRoute>
        }
      />

      </Routes>
    </>
  );
};

export default AppRoutes;

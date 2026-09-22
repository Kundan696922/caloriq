import { useContext } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatBubble from "../ai/ChatBubble";
import { AuthContext } from "../../context/AuthContext";

export default function Layout() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text-primary">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Outlet />
      </main>
      <Footer />
      {/* Only for logged-in users. Unmounts on logout, which clears chat state. */}
      {!loading && isAuthenticated && <ChatBubble />}
    </div>
  );
}




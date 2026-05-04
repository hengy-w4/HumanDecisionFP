import { useState } from "react";
import HomePage from "./pages/HomePage/HomePage.jsx";
import PetProfilePage from "./pages/PetProfilePage/PetProfilePage.jsx";
import SymptomChatPage from "./pages/SymptomChatPage/SymptomChatPage.jsx";

export default function App() {
  const [page, setPage] = useState("home");

  if (page === "chat") {
    return <SymptomChatPage onNavigateHome={() => setPage("home")} />;
  }

  if (page === "profile") {
    return <PetProfilePage onNavigateHome={() => setPage("home")} />;
  }

  return (
    <HomePage
      onNavigateChat={() => setPage("chat")}
      onNavigateProfile={() => setPage("profile")}
    />
  );
}

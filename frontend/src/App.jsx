import { useState } from "react";
import HomePage from "./pages/HomePage/HomePage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import PetProfilePage from "./pages/PetProfilePage/PetProfilePage.jsx";
import SymptomChatPage from "./pages/SymptomChatPage/SymptomChatPage.jsx";
import TriageResultPage from "./pages/TriageResultPage/TriageResultPage.jsx";
import VetFeedbackPage from "./pages/VetFeedbackPage/VetFeedbackPage.jsx";

export default function App() {
  const [page, setPage] = useState("login");
  const [triageResult, setTriageResult] = useState(null);

  if (page === "login") {
    return <LoginPage onLogin={() => setPage("home")} />;
  }

  if (page === "chat") {
    return (
      <SymptomChatPage
        onNavigateHome={() => setPage("home")}
        onNavigateResult={() => setPage("result")}
        onTriageComplete={setTriageResult}
      />
    );
  }

  if (page === "profile") {
    return <PetProfilePage onNavigateHome={() => setPage("home")} />;
  }

  if (page === "result") {
    return (
      <TriageResultPage
        result={triageResult}
        onNavigateChat={() => setPage("chat")}
        onNavigateFeedback={() => setPage("feedback")}
        onNavigateHome={() => setPage("home")}
      />
    );
  }

  if (page === "feedback") {
    return (
      <VetFeedbackPage
        triageResult={triageResult}
        onNavigateHome={() => setPage("home")}
        onNavigateResult={() => setPage("result")}
      />
    );
  }

  return (
    <HomePage
      onNavigateChat={() => setPage("chat")}
      onNavigateProfile={() => setPage("profile")}
    />
  );
}

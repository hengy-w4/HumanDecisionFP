import { mockHistory } from "../../data/mockHistory.js";
import { mockProfile } from "../../data/mockProfile.js";
import PetProfileSummaryCard from "./PetProfileSummaryCard.jsx";
import ScreeningHistoryList from "./ScreeningHistoryList.jsx";
import "./homePage.css";

const navItems = ["Chatbot", "Profile", "Feedback"];

export default function HomePage({ onNavigateChat, onNavigateProfile }) {
  const handleNavClick = (item) => {
    if (item === "Chatbot") {
      onNavigateChat();
    }

    if (item === "Profile") {
      onNavigateProfile();
    }
  };

  return (
    <main className="home-page">
      <header className="home-header">
        <div>
          <p className="eyebrow">PetTriage Dashboard</p>
          <h1>Welcome back, {mockProfile.ownerName}</h1>
          <p className="home-header__copy">
            Review {mockProfile.petName}'s profile, start a new symptom check,
            or follow up on previous screening results.
          </p>
        </div>

        <nav className="home-nav" aria-label="Dashboard navigation">
          {navItems.map((item) => (
            <button
              className="nav-button"
              type="button"
              key={item}
              onClick={() => handleNavClick(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      <section className="home-action-band" aria-labelledby="new-check-title">
        <div>
          <p className="eyebrow">New Screening</p>
          <h2 id="new-check-title">Check symptoms as soon as something changes</h2>
          <p>
            Start a guided triage session for free-text symptoms, urgency,
            reasoning, red flags, and recommended next steps.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={onNavigateChat}>
          Start New Symptom Check
        </button>
      </section>

      <div className="home-content">
        <PetProfileSummaryCard profile={mockProfile} />
        <ScreeningHistoryList screenings={mockHistory} />
      </div>
    </main>
  );
}

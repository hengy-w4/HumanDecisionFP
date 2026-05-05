import { useRef, useState } from "react";
import { submitTriage } from "../../api/triageApi.js";
import { mockProfile } from "../../data/mockProfile.js";
import MiniUrgencyCard from "./MiniUrgencyCard.jsx";
import "./symptomChatPage.css";

function buildConversationContext(messages, nextMessage) {
  const transcript = [
    ...messages,
    { role: "owner", content: nextMessage },
  ]
    .map((message) => `${message.role === "owner" ? "Owner" : "PetTriage"}: ${message.content}`)
    .join("\n");

  return `Conversation so far:\n${transcript}`;
}

export default function SymptomChatPage({
  onNavigateHome,
  onNavigateResult,
  onTriageComplete,
}) {
  const inputRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [finalResult, setFinalResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAnsweringClarifyingQuestion, setIsAnsweringClarifyingQuestion] =
    useState(false);
  const hasStartedChat = messages.length > 0;

  const focusClarifyingAnswer = () => {
    setIsAnsweringClarifyingQuestion(true);
    inputRef.current?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage) {
      setError("Please describe what you are noticing before submitting.");
      return;
    }

    const nextMessages = [
      ...messages,
      {
        id: crypto.randomUUID(),
        role: "owner",
        content: trimmedMessage,
      },
    ];
    const userMessageCount = nextMessages.filter(
      (message) => message.role === "owner",
    ).length;
    const conversationContext = buildConversationContext(messages, trimmedMessage);

    setMessages(nextMessages);
    setDraftMessage("");
    setError("");
    setIsLoading(true);

    try {
      const nextResult = await submitTriage({
        profile: mockProfile,
        symptoms: conversationContext,
      });

      const needsClarification =
        Boolean(nextResult.clarifyingQuestion) &&
        userMessageCount === 1 &&
        nextResult.urgency !== "Emergency";

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: needsClarification
          ? nextResult.clarifyingQuestion
          : nextResult.reasoning,
        canAnswerClarifyingQuestion: needsClarification,
      };
      const completedMessages = [...nextMessages, assistantMessage];

      setMessages(completedMessages);

      if (needsClarification) {
        setFinalResult(null);
      } else {
        const completedResult = {
          ...nextResult,
          chatHistory: completedMessages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
          })),
        };
        setFinalResult(completedResult);
        onTriageComplete?.(completedResult);
      }

      setIsAnsweringClarifyingQuestion(false);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="symptom-chat-page">
      <header className="chat-header">
        <button className="back-button" type="button" onClick={onNavigateHome}>
          Back Home
        </button>
        <div>
          <p className="eyebrow">PetTriage Assistant</p>
          <h1>Tell us what is happening with {mockProfile.petName}</h1>
          <p>
            Share symptoms in your own words. The assistant may ask a follow-up
            question before showing a final urgency recommendation.
          </p>
        </div>
      </header>

      {!hasStartedChat ? (
        <section className="chat-start-card" aria-labelledby="input-title">
          <p className="eyebrow">New Check</p>
          <h2 id="input-title">Start with what you are noticing</h2>
          <form className="chat-composer chat-composer--start" onSubmit={handleSubmit}>
            <label htmlFor="symptom-message">Describe symptoms</label>
            <textarea
              id="symptom-message"
              ref={inputRef}
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              placeholder="Example: Mochi has been vomiting, seems tired, and will not eat."
              rows="6"
            />
            <button className="primary-button" type="submit" disabled={isLoading}>
              {isLoading ? "Checking..." : "Send Message"}
            </button>
          </form>
          {error ? <p className="input-error">{error}</p> : null}
          <div className="disclaimer">
            PetTriage is not a diagnosis. For severe symptoms or rapid changes,
            contact a veterinarian immediately.
          </div>
        </section>
      ) : (
        <section className="chat-window" aria-labelledby="assistant-title">
          <div className="chat-window__header">
            <div>
              <p className="eyebrow">Conversation</p>
              <h2 id="assistant-title">PetTriage Assistant</h2>
            </div>
            <span>{messages.length} messages</span>
          </div>

          <div className="chat-thread" aria-label="Chat transcript">
            {messages.map((message) => (
              <article
                className={
                  message.role === "owner"
                    ? "chat-message chat-message--owner"
                    : "chat-message chat-message--assistant"
                }
                key={message.id}
              >
                <span>{message.role === "owner" ? "You" : "PetTriage"}</span>
                <p>{message.content}</p>
                {message.canAnswerClarifyingQuestion ? (
                  <button
                    className="clarifying-button"
                    type="button"
                    onClick={focusClarifyingAnswer}
                  >
                    Answer clarifying question
                  </button>
                ) : null}
              </article>
            ))}
            {isLoading ? (
              <article className="chat-message chat-message--assistant">
                <span>PetTriage</span>
                <p>Reviewing the details...</p>
              </article>
            ) : null}
          </div>

          {finalResult ? (
            <section className="final-result" aria-labelledby="final-result-title">
              <div className="final-result__header">
                <div>
                  <p className="eyebrow">Final Result</p>
                  <h2 id="final-result-title">Urgency recommendation</h2>
                </div>
                <button
                  className="text-button"
                  type="button"
                  onClick={onNavigateResult}
                >
                  View Full Result
                </button>
              </div>

              <MiniUrgencyCard
                urgency={finalResult.urgency}
                recommendedAction={finalResult.recommendedAction}
                confidence={finalResult.confidence}
              />

              <div className="response-grid">
                <section>
                  <h3>Reasoning</h3>
                  <p>{finalResult.reasoning}</p>
                </section>

                <section>
                  <h3>Red flags detected</h3>
                  {finalResult.redFlags.length > 0 ? (
                    <ul>
                      {finalResult.redFlags.map((flag) => (
                        <li key={flag}>{flag}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No red flags detected from the submitted text.</p>
                  )}
                </section>

                <section>
                  <h3>Recommended action</h3>
                  <p>{finalResult.recommendedAction}</p>
                </section>

                <section>
                  <h3>Confidence</h3>
                  <p>{finalResult.confidenceLabel}</p>
                </section>
              </div>
            </section>
          ) : null}

          {error ? <p className="input-error">{error}</p> : null}

          <form className="chat-composer chat-composer--sticky" onSubmit={handleSubmit}>
            <label htmlFor="follow-up-message">
              {isAnsweringClarifyingQuestion
                ? "Answer clarifying question"
                : "Send another message"}
            </label>
            <textarea
              id="follow-up-message"
              ref={inputRef}
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              placeholder={
                isAnsweringClarifyingQuestion
                  ? "Add more details here..."
                  : "Add more symptoms or updates..."
              }
              rows="3"
            />
            <button className="primary-button" type="submit" disabled={isLoading}>
              {isLoading ? "Checking..." : "Send"}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}

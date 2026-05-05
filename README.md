# PetTriage

PetTriage is a full-stack pet symptom triage prototype. It combines a React/Vite frontend with a FastAPI backend, deterministic emergency red-flag rules, and an OpenAI-powered LLM triage module.

The app lets a pet owner:

- Sign in to a session
- Review a pet profile
- Chat with the PetTriage Assistant about symptoms
- Receive an urgency recommendation
- Review a final triage report
- Submit local vet outcome feedback

PetTriage is not a diagnosis and is not a substitute for veterinary care.

## Tech Stack

- Frontend: React, Vite, CSS
- Backend: FastAPI, Pydantic, Uvicorn
- LLM: OpenAI Python SDK
- Tests: pytest

## Project Structure

```text
.
├── data/
│   ├── red_flags.json
│   └── eval_dataset.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── src/
│   ├── config.py
│   ├── llm_triage.py
│   ├── main.py
│   ├── prompt_templates.py
│   ├── rule_engine.py
│   └── schemas.py
├── tests/
├── requirements.txt
└── README.md
```

## Urgency Levels

The backend uses these canonical urgency values:

- `monitor_at_home`
- `office_appointment`
- `emergency`

The frontend displays them as:

- `Monitor`
- `Urgent`
- `Emergency`

## Setup

### Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a local `.env` file:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

Do not commit `.env` or paste API keys into chat/logs.

Run the backend:

```bash
uvicorn src.main:app --host 127.0.0.1 --port 8000
```

API docs:

```text
http://127.0.0.1:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

Open:

```text
http://127.0.0.1:5173/
```

The frontend expects the backend at:

```text
http://127.0.0.1:8000
```

You can override this with:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Main App Flow

1. Log in from the session login page.
2. Use the Home dashboard to open the chatbot or profile.
3. Chat with PetTriage Assistant about symptoms.
4. The frontend sends the conversation context to `POST /triage`.
5. The backend runs emergency rules first, then the LLM if no rule emergency is triggered.
6. The chatbot displays assistant messages and a final urgency result.
7. The final report shows urgency, clinical reasoning, red flags, chat history, pet context, and next steps.
8. The feedback form collects vet outcome details locally in the frontend.

## Backend Endpoints

### `POST /triage`

Runs rule-based and LLM-based triage.

Example:

```bash
curl -X POST "http://127.0.0.1:8000/triage" \
  -H "Content-Type: application/json" \
  -d '{
    "pet_profile": {
      "species": "dog",
      "pet_name": "Mochi",
      "breed": "Corgi mix",
      "age": 5,
      "sex": "Female",
      "weight": 24,
      "known_conditions": ["Sensitive stomach"]
    },
    "symptom_text": "Mochi has vomited twice today and seems tired."
  }'
```

Example response:

```json
{
  "final_urgency": "office_appointment",
  "decision_source": "llm",
  "reasoning": "The symptoms warrant veterinary evaluation...",
  "rule_result": {
    "urgency": "monitor_at_home",
    "source": "rule_engine",
    "reasoning": "No hard red-flag rule was triggered.",
    "confidence": "medium",
    "clarifying_question": null,
    "triggered_rules": []
  },
  "llm_result": {
    "urgency": "office_appointment",
    "source": "llm",
    "reasoning": "The symptoms warrant veterinary evaluation...",
    "confidence": "medium",
    "clarifying_question": "Has Mochi had diarrhea or signs of pain?",
    "triggered_rules": []
  }
}
```

### `POST /profiles`

Creates an in-memory pet profile.

### `GET /profiles`

Lists in-memory pet profiles.

### `GET /profiles/{profile_id}`

Gets one pet profile.

### `PUT /profiles/{profile_id}`

Updates one pet profile.

### `POST /overrides`

Stores an in-memory owner override for a triage result.

### `GET /overrides`

Lists in-memory override records.

### `POST /vet-feedback`

Stores an in-memory vet feedback record. The current frontend feedback page is local-only, but the backend endpoint is available for future integration.

### `GET /vet-feedback`

Lists in-memory vet feedback records.

## Triage Decision Flow

1. Run the deterministic rule engine against `data/red_flags.json`.
2. If a rule returns `emergency`, return that emergency result immediately.
3. Otherwise, call the LLM triage module.
4. If the LLM returns `emergency`, return the LLM emergency result.
5. Otherwise, return the LLM urgency and reasoning.

Emergency consistency is enforced:

- Emergency rule results include triggered rules.
- LLM emergency results are normalized to include at least one red flag.
- The frontend never displays `Emergency` with `No red flags detected`.

## Frontend Pages

- `LoginPage`: session login/signup/reset UI
- `HomePage`: dashboard, pet profile summary, interactive screening history
- `PetProfilePage`: editable pet profile form
- `SymptomChatPage`: conversational PetTriage Assistant
- `TriageResultPage`: final urgency report with chat history and pet context
- `VetFeedbackPage`: frontend-only vet outcome feedback form

## Testing

Run backend tests:

```bash
pytest
```

Build frontend:

```bash
cd frontend
npm run build
```

Expected current status:

```text
105 passed
vite build successful
```

## Notes

- Backend records for profiles, overrides, and vet feedback are stored in memory and reset when the server restarts.
- The frontend currently uses mock profile/history data for the UI experience.
- The chatbot sends conversation context to the backend as free-text `symptom_text`.
- OpenAI failures fall back to conservative office-appointment guidance.

## Safety Disclaimer

PetTriage is for educational and software development purposes. It provides urgency guidance only, not diagnosis or treatment. For severe symptoms, rapid worsening, suspected poisoning, breathing problems, collapse, seizures, uncontrolled bleeding, or any urgent concern, contact a licensed veterinarian or emergency veterinary clinic immediately.

# PetTriage API

PetTriage is a small FastAPI service for pet symptom triage. It combines a deterministic rule engine with an LLM-style triage module and returns a final urgency recommendation for a pet based on profile information and a free-text symptom description.

Current urgency levels are:

- `monitor_at_home`
- `office_appointment`
- `emergency`

The current implementation includes placeholder logic for both the rule engine and LLM module, making it a starting point for building a fuller veterinary triage workflow.

## Project Structure

```text
.
├── pettriage/
│   ├── main.py          # FastAPI app and /triage endpoint
│   ├── rule_engine.py   # Deterministic red-flag/rule-based triage logic
│   ├── llm_triage.py    # LLM triage integration placeholder
│   └── scehmas.py       # Pydantic request/response models
├── requirements.txt
├── .gitignore
└── README.md
```

Note: `pettriage/main.py` imports `pettriage.schemas`, but the model file is currently named `scehmas.py`. Rename `pettriage/scehmas.py` to `pettriage/schemas.py` before running the API.

## Requirements

- Python 3.10+
- FastAPI
- Uvicorn
- Pydantic
- pytest
- python-dotenv
- openai

Install dependencies from `requirements.txt`.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

If you plan to replace the mock LLM triage logic with the OpenAI API, create a `.env` file and add your API key:

```bash
OPENAI_API_KEY=your_api_key_here
```

## Run the API

After renaming `scehmas.py` to `schemas.py`, start the development server:

```bash
uvicorn pettriage.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## Endpoint

### `POST /triage`

Accepts a pet profile and symptom description, runs both triage modules, and returns the final urgency decision.

Example request:

```bash
curl -X POST "http://127.0.0.1:8000/triage" \
  -H "Content-Type: application/json" \
  -d '{
    "pet_profile": {
      "species": "dog",
      "breed": "Labrador Retriever",
      "age": 6,
      "sex": "female",
      "weight": 28.5,
      "known_conditions": ["arthritis"]
    },
    "symptom_text": "She has been vomiting since this morning and seems tired."
  }'
```

Example response:

```json
{
  "final_urgency": "office_appointment",
  "decision_source": "llm",
  "reasoning": "Mock LLM result. Replace with structured LLM triage logic.",
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
    "reasoning": "Mock LLM result. Replace with structured LLM triage logic.",
    "confidence": "medium",
    "clarifying_question": null,
    "triggered_rules": []
  }
}
```

## Decision Flow

The endpoint uses this decision order:

1. Run the rule engine.
2. Run the LLM triage module.
3. If the rule engine returns `emergency`, use the rule engine decision.
4. Otherwise, if the LLM module returns `emergency`, use the LLM decision.
5. Otherwise, use the LLM module's urgency and reasoning.

This gives hard-coded safety rules priority over the LLM when an emergency rule is triggered.

## Data Models

### `PetProfile`

```json
{
  "species": "string",
  "breed": "string | null",
  "age": "number | null",
  "sex": "string | null",
  "weight": "number | null",
  "known_conditions": ["string"]
}
```

### `TriageRequest`

```json
{
  "pet_profile": "PetProfile",
  "symptom_text": "string"
}
```

### `ModuleResult`

```json
{
  "urgency": "monitor_at_home | office_appointment | emergency",
  "source": "string",
  "reasoning": "string",
  "confidence": "low | medium | high",
  "clarifying_question": "string | null",
  "triggered_rules": ["string"]
}
```

### `TriageResponse`

```json
{
  "final_urgency": "monitor_at_home | office_appointment | emergency",
  "decision_source": "string",
  "reasoning": "string",
  "rule_result": "ModuleResult | null",
  "llm_result": "ModuleResult | null"
}
```

## Development Notes

- `rule_engine.py` currently returns `monitor_at_home` unless expanded with red-flag rules.
- `llm_triage.py` currently returns a mock `office_appointment` result.
- Add tests under a `tests/` directory when expanding the decision logic.
- Keep emergency criteria explicit and auditable in the rule engine.

## Important Disclaimer

This project is for software development and educational purposes. It is not a substitute for professional veterinary advice, diagnosis, or treatment. For urgent symptoms or suspected emergencies, contact a licensed veterinarian or emergency veterinary clinic.

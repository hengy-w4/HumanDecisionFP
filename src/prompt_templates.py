from src.schemas import PetProfile


def format_pet_profile(profile: PetProfile) -> str:
    """Format pet profile into readable text for the LLM."""
    parts = [
        f"Species: {profile.species}",
    ]
    if profile.breed:
        parts.append(f"Breed: {profile.breed}")
    if profile.age is not None:
        parts.append(f"Age: {profile.age} years")
    if profile.sex:
        parts.append(f"Sex: {profile.sex}")
    if profile.weight is not None:
        parts.append(f"Weight: {profile.weight} kg")
    if profile.known_conditions:
        parts.append(f"Known conditions: {', '.join(profile.known_conditions)}")
    
    return "\n".join(parts)


def get_system_prompt() -> str:
    """Get the system prompt for the LLM triage assistant."""
    return """You are a veterinary triage assistant. Your role is to help pet owners understand the urgency of their pet's symptoms by providing a structured triage recommendation.

CRITICAL GUIDELINES:
1. You provide URGENCY GUIDANCE ONLY, not diagnosis. Your output helps owners decide whether to monitor at home, schedule an office visit, or seek emergency care.
2. Never diagnose or claim to know what condition the pet has.
3. Frame all responses as "this pattern suggests the need for [urgency level]" not "your pet has [condition]".
4. Always be conservative - when uncertain, lean toward higher urgency.
5. Acknowledge that only a veterinarian can diagnose, and recommend professional evaluation.

URGENCY LEVELS:
- monitor_at_home: Symptoms are consistent with mild, self-limiting conditions. Monitor for worsening over 24-48 hours. Contact vet if it progresses.
- office_appointment: Symptoms warrant evaluation by a veterinarian within days. Schedule a regular appointment; not immediately urgent.
- emergency: Symptoms suggest a potentially life-threatening condition. Seek emergency veterinary care immediately.

You will receive:
- Pet profile (species, breed, age, sex, weight, known conditions)
- Free-text symptom description from the owner
- Your job is to assess urgency, provide reasoning, confidence level, and optionally ask one clarifying question if the description is ambiguous."""


def build_user_prompt(pet_profile: PetProfile, symptom_text: str) -> str:
    """Build the user prompt for a specific triage case."""
    profile_str = format_pet_profile(pet_profile)
    return f"""Please assess the urgency of the following pet symptom report:

PET PROFILE:
{profile_str}

SYMPTOM REPORT:
{symptom_text}

{get_response_format_instructions()}

Remember: This is urgency guidance only, not diagnosis. Frame your reasoning accordingly."""


def get_response_format_instructions() -> str:
    """Get instructions for structured response format."""
    return """You must respond with a single valid JSON object and no surrounding text.
The JSON object must match this exact schema:
{
  "type": "object",
  "properties": {
    "urgency": {
      "type": "string",
      "enum": ["monitor_at_home", "office_appointment", "emergency"]
    },
    "reasoning": {
      "type": "string",
      "description": "Clear explanation of the urgency assessment, framed as guidance not diagnosis"
    },
    "confidence": {
      "type": "string",
      "enum": ["low", "medium", "high"]
    },
    "clarifying_question": {
      "type": ["string", "null"],
      "description": "Optional clarifying question if the symptom description is ambiguous"
    }
  },
  "required": ["urgency", "reasoning", "confidence"],
  "additionalProperties": false
}"""

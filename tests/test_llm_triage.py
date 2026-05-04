import json
from types import SimpleNamespace
from unittest.mock import patch

import pytest

from src.llm_triage import (
    _call_openai_api,
    _parse_llm_response,
    _validate_response_structure,
    run_llm_triage,
)
from src.prompt_templates import build_user_prompt, format_pet_profile, get_system_prompt
from src.schemas import PetProfile


class TestPromptTemplates:
    """Test prompt template generation."""

    def test_format_pet_profile_minimal(self):
        profile = PetProfile(species="dog")
        result = format_pet_profile(profile)
        assert "Species: dog" in result
        assert "Breed" not in result

    def test_format_pet_profile_full(self):
        profile = PetProfile(
            species="cat",
            breed="Siamese",
            age=5.0,
            sex="male",
            weight=4.5,
            known_conditions=["hyperthyroidism"],
        )
        result = format_pet_profile(profile)
        assert "Species: cat" in result
        assert "Breed: Siamese" in result
        assert "Age: 5.0 years" in result
        assert "Sex: male" in result
        assert "Weight: 4.5 kg" in result
        assert "hyperthyroidism" in result

    def test_build_user_prompt_includes_profile_and_symptoms(self):
        profile = PetProfile(species="dog", breed="Lab", age=3.0)
        symptom_text = "Vomiting and diarrhea"
        prompt = build_user_prompt(profile, symptom_text)
        assert "Species: dog" in prompt
        assert "Breed: Lab" in prompt
        assert "Vomiting and diarrhea" in prompt
        assert "urgency" in prompt
        assert "single valid JSON object" in prompt
        assert "additionalProperties" in prompt

    def test_get_system_prompt_includes_critical_guidelines(self):
        system_prompt = get_system_prompt()
        assert "URGENCY GUIDANCE ONLY" in system_prompt
        assert "not diagnosis" in system_prompt
        assert "monitor_at_home" in system_prompt
        assert "office_appointment" in system_prompt
        assert "emergency" in system_prompt


class TestResponseParsing:
    """Test LLM response parsing and validation."""

    def test_parse_llm_response_valid_json(self):
        response = '{"urgency": "emergency", "reasoning": "Severe symptoms", "confidence": "high"}'
        result = _parse_llm_response(response)
        assert result["urgency"] == "emergency"
        assert result["reasoning"] == "Severe symptoms"
        assert result["confidence"] == "high"

    def test_parse_llm_response_rejects_extra_text(self):
        response = 'The assessment is: {"urgency": "office_appointment", "reasoning": "Mild symptoms", "confidence": "medium"} This is the end.'
        with pytest.raises(ValueError, match="Failed to parse"):
            _parse_llm_response(response)

    def test_parse_llm_response_invalid_json(self):
        response = "This is not JSON at all"
        with pytest.raises(ValueError):
            _parse_llm_response(response)

    def test_parse_llm_response_rejects_json_array(self):
        response = '[{"urgency": "emergency", "reasoning": "Test", "confidence": "high"}]'
        with pytest.raises(ValueError, match="JSON object"):
            _parse_llm_response(response)

    def test_validate_response_structure_valid(self):
        data = {
            "urgency": "monitor_at_home",
            "reasoning": "Symptoms are mild",
            "confidence": "high",
            "clarifying_question": None,
        }
        _validate_response_structure(data)  # Should not raise

    def test_validate_response_structure_missing_field(self):
        data = {"urgency": "emergency", "reasoning": "Test"}
        with pytest.raises(ValueError, match="Missing required fields"):
            _validate_response_structure(data)

    def test_validate_response_structure_invalid_urgency(self):
        data = {
            "urgency": "invalid_urgency",
            "reasoning": "Test",
            "confidence": "high",
        }
        with pytest.raises(ValueError, match="Invalid urgency"):
            _validate_response_structure(data)

    def test_validate_response_structure_invalid_confidence(self):
        data = {
            "urgency": "emergency",
            "reasoning": "Test",
            "confidence": "very_high",
        }
        with pytest.raises(ValueError, match="Invalid confidence"):
            _validate_response_structure(data)

    def test_validate_response_structure_rejects_extra_fields(self):
        data = {
            "urgency": "emergency",
            "reasoning": "Test",
            "confidence": "high",
            "diagnosis": "Blocked urethra",
        }
        with pytest.raises(ValueError, match="Unexpected fields"):
            _validate_response_structure(data)

    def test_validate_response_structure_rejects_blank_reasoning(self):
        data = {
            "urgency": "emergency",
            "reasoning": "  ",
            "confidence": "high",
        }
        with pytest.raises(ValueError, match="non-empty"):
            _validate_response_structure(data)

    def test_validate_response_structure_rejects_non_string_clarifying_question(self):
        data = {
            "urgency": "office_appointment",
            "reasoning": "Needs vet evaluation.",
            "confidence": "medium",
            "clarifying_question": 123,
        }
        with pytest.raises(ValueError, match="string or null"):
            _validate_response_structure(data)


class TestOpenAIAPI:
    """Test OpenAI API integration options without making network calls."""

    @patch("src.llm_triage.get_openai_model")
    @patch("src.llm_triage._get_openai_client")
    def test_call_openai_api_uses_json_mode(self, mock_client_factory, mock_model):
        mock_model.return_value = "gpt-test"
        mock_client = mock_client_factory.return_value
        mock_client.chat.completions.create.return_value = SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(
                        content='{"urgency": "monitor_at_home", "reasoning": "Mild.", "confidence": "high"}'
                    )
                )
            ]
        )

        result = _call_openai_api("system prompt", "user prompt")

        assert json.loads(result)["urgency"] == "monitor_at_home"
        mock_client.chat.completions.create.assert_called_once()
        kwargs = mock_client.chat.completions.create.call_args.kwargs
        assert kwargs["model"] == "gpt-test"
        assert kwargs["response_format"] == {"type": "json_object"}
        assert kwargs["messages"] == [
            {"role": "system", "content": "system prompt"},
            {"role": "user", "content": "user prompt"},
        ]

    @patch("src.llm_triage.get_openai_model")
    @patch("src.llm_triage._get_openai_client")
    def test_call_openai_api_rejects_missing_content(self, mock_client_factory, mock_model):
        mock_model.return_value = "gpt-test"
        mock_client = mock_client_factory.return_value
        mock_client.chat.completions.create.return_value = SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content=None))]
        )

        with pytest.raises(ValueError, match="message content"):
            _call_openai_api("system prompt", "user prompt")


class TestLLMTriage:
    """Test end-to-end LLM triage logic."""

    @patch("src.llm_triage._call_openai_api")
    def test_run_llm_triage_successful(self, mock_api):
        """Test successful LLM triage call."""
        mock_response = json.dumps(
            {
                "urgency": "office_appointment",
                "reasoning": "Mild symptoms consistent with upper respiratory infection",
                "confidence": "medium",
                "clarifying_question": None,
            }
        )
        mock_api.return_value = mock_response

        profile = PetProfile(species="cat", age=4.0)
        symptom_text = "Sneezing and mild cough"

        result = run_llm_triage(profile, symptom_text)

        assert result.urgency == "office_appointment"
        assert result.source == "llm"
        assert result.confidence == "medium"
        assert "upper respiratory" in result.reasoning

    @patch("src.llm_triage._call_openai_api")
    def test_run_llm_triage_with_clarifying_question(self, mock_api):
        """Test LLM returns clarifying question."""
        mock_response = json.dumps(
            {
                "urgency": "monitor_at_home",
                "reasoning": "Symptoms are likely benign",
                "confidence": "low",
                "clarifying_question": "How long has the pet been showing these symptoms?",
            }
        )
        mock_api.return_value = mock_response

        profile = PetProfile(species="dog")
        symptom_text = "Acting slightly off"

        result = run_llm_triage(profile, symptom_text)

        assert result.urgency == "monitor_at_home"
        assert "How long" in result.clarifying_question

    @patch("src.llm_triage._call_openai_api")
    def test_run_llm_triage_api_error_fallback(self, mock_api):
        """Test fallback behavior when API fails."""
        mock_api.side_effect = Exception("API error")

        profile = PetProfile(species="dog")
        symptom_text = "Vomiting"

        result = run_llm_triage(profile, symptom_text)

        assert result.urgency == "office_appointment"
        assert result.confidence == "low"
        assert "fallback_error" in result.triggered_rules
        assert "Unable to fully process" in result.reasoning

    @patch("src.llm_triage._call_openai_api")
    def test_run_llm_triage_malformed_json_fallback(self, mock_api):
        """Test fallback when LLM returns malformed JSON."""
        mock_api.return_value = "Not valid JSON at all"

        profile = PetProfile(species="cat")
        symptom_text = "Acting strange"

        result = run_llm_triage(profile, symptom_text)

        assert result.urgency == "office_appointment"
        assert result.confidence == "low"
        assert "fallback_error" in result.triggered_rules

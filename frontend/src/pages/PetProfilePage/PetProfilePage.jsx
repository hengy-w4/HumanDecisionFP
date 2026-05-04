import { useMemo, useState } from "react";
import { mockProfile } from "../../data/mockProfile.js";
import PetProfileForm from "./PetProfileForm.jsx";
import "./petProfilePage.css";

function listToText(value) {
  return Array.isArray(value) ? value.join(", ") : value || "";
}

export default function PetProfilePage({ onNavigateHome }) {
  const initialFormData = useMemo(
    () => ({
      petName: mockProfile.petName,
      species: mockProfile.species,
      breed: mockProfile.breed,
      age: mockProfile.age,
      weight: mockProfile.weight,
      sex: mockProfile.sex,
      spayedNeutered: mockProfile.spayedNeutered,
      knownConditions: listToText(mockProfile.knownConditions),
      medications: listToText(mockProfile.medications),
      vaccinationStatus: mockProfile.vaccinationStatus,
    }),
    [],
  );

  const [formData, setFormData] = useState(initialFormData);
  const [savedMessage, setSavedMessage] = useState("");

  const handleChange = (name, value) => {
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
    setSavedMessage("");
  };

  const handleSave = (event) => {
    event.preventDefault();
    setSavedMessage("Profile saved for this session.");
  };

  return (
    <main className="pet-profile-page">
      <header className="profile-page-header">
        <button className="back-button" type="button" onClick={onNavigateHome}>
          Back Home
        </button>
        <div>
          <p className="eyebrow">Pet Profile</p>
          <h1>Edit {formData.petName || "pet"}'s care details</h1>
          <p>
            Keep medical context, medications, and vaccination status current so
            future symptom checks start with better information.
          </p>
        </div>
      </header>

      <div className="profile-page-layout">
        <section className="profile-preview" aria-labelledby="preview-title">
          <p className="eyebrow">Summary</p>
          <h2 id="preview-title">{formData.petName || "Unnamed pet"}</h2>
          <dl>
            <div>
              <dt>Species</dt>
              <dd>{formData.species}</dd>
            </div>
            <div>
              <dt>Breed</dt>
              <dd>{formData.breed || "Not listed"}</dd>
            </div>
            <div>
              <dt>Age</dt>
              <dd>{formData.age || "Not listed"}</dd>
            </div>
            <div>
              <dt>Weight</dt>
              <dd>{formData.weight || "Not listed"}</dd>
            </div>
            <div>
              <dt>Vaccines</dt>
              <dd>{formData.vaccinationStatus}</dd>
            </div>
          </dl>
        </section>

        <section className="profile-form-panel" aria-labelledby="form-title">
          <div className="profile-form-panel__heading">
            <p className="eyebrow">Details</p>
            <h2 id="form-title">Create or edit pet profile</h2>
          </div>
          <PetProfileForm
            formData={formData}
            onChange={handleChange}
            onSave={handleSave}
            savedMessage={savedMessage}
          />
        </section>
      </div>
    </main>
  );
}

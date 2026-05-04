export default function PetProfileSummaryCard({ profile }) {
  const conditions = profile.knownConditions?.join(", ") || "None listed";

  return (
    <section className="profile-card" aria-labelledby="profile-card-title">
      <div className="profile-card__header">
        <div>
          <p className="eyebrow">Pet Profile</p>
          <h2 id="profile-card-title">{profile.petName}</h2>
        </div>
        <span className="profile-card__species">{profile.species}</span>
      </div>

      <div className="profile-grid">
        <div>
          <span>Breed</span>
          <strong>{profile.breed}</strong>
        </div>
        <div>
          <span>Age</span>
          <strong>{profile.age}</strong>
        </div>
        <div>
          <span>Weight</span>
          <strong>{profile.weight}</strong>
        </div>
        <div>
          <span>Sex</span>
          <strong>{profile.sex}</strong>
        </div>
      </div>

      <div className="profile-details">
        <p>
          <span>Spayed/neutered</span>
          <strong>{profile.spayedNeutered}</strong>
        </p>
        <p>
          <span>Known conditions</span>
          <strong>{conditions}</strong>
        </p>
        <p>
          <span>Vaccines</span>
          <strong>{profile.vaccinationStatus}</strong>
        </p>
      </div>
    </section>
  );
}

export const mockHistory = [
  {
    id: 1,
    date: "May 2, 2026",
    summary: "Vomiting after breakfast",
    urgency: "Monitor",
    action: "Small water portions and bland food if symptoms settle.",
    reasoning:
      "Symptoms were limited and no hard emergency red flags were reported, so careful monitoring was recommended.",
    redFlags: [],
    followUp:
      "Contact a veterinarian if vomiting repeated, appetite dropped, or energy changed.",
  },
  {
    id: 2,
    date: "April 18, 2026",
    summary: "Limping after park visit",
    urgency: "Urgent",
    action: "Schedule a vet visit if limping continues or worsens.",
    reasoning:
      "New limping after activity can involve pain or injury, especially if weight-bearing changes.",
    redFlags: ["pain", "worsening limp"],
    followUp:
      "Rest from running and schedule a vet visit if limping continued into the next day.",
  },
  {
    id: 3,
    date: "March 27, 2026",
    summary: "Mild itching and paw licking",
    urgency: "Monitor",
    action: "Track flare-ups and avoid suspected allergens.",
    reasoning:
      "Mild itching without swelling, wounds, or major behavior change was reasonable to monitor.",
    redFlags: [],
    followUp:
      "Track timing, surfaces, foods, and any skin redness before the next routine visit.",
  },
  {
    id: 4,
    date: "March 10, 2026",
    summary: "Coughing after exercise",
    urgency: "Urgent",
    action: "Call the vet if coughing repeats, worsens, or happens at rest.",
    reasoning:
      "Exercise-related coughing can be mild, but repeated coughing may need veterinary evaluation.",
    redFlags: ["cough"],
    followUp:
      "Avoid strenuous activity and note whether coughing happens during rest or sleep.",
  },
  {
    id: 5,
    date: "February 22, 2026",
    summary: "Loose stool for one day",
    urgency: "Monitor",
    action: "Offer water, monitor stool, and call the vet if it continues.",
    reasoning:
      "A single day of loose stool without major energy or appetite changes can often be monitored.",
    redFlags: [],
    followUp:
      "Track frequency, appetite, hydration, and any blood or repeated diarrhea.",
  },
  {
    id: 6,
    date: "February 5, 2026",
    summary: "Ate unknown food outside",
    urgency: "Emergency",
    action: "Contact an emergency vet or poison control immediately.",
    reasoning:
      "Unknown ingestion can become dangerous quickly depending on the substance and amount.",
    redFlags: ["unknown ingestion"],
    followUp:
      "Save any packaging or photos of the substance and avoid inducing vomiting unless told by a vet.",
  },
  {
    id: 7,
    date: "January 19, 2026",
    summary: "Watery eyes and sneezing",
    urgency: "Monitor",
    action: "Monitor for discharge, appetite change, or worsening breathing.",
    reasoning:
      "Mild sneezing and watery eyes can be monitored if breathing and appetite are normal.",
    redFlags: [],
    followUp:
      "Note whether symptoms happen after outdoor walks, cleaning products, or dusty areas.",
  },
];

// Visitor copy from the approved content inventory, proof and FAQ ledgers. Nothing here
// may be reworded into a broader claim: modules and features stay model-qualified.

export interface TitledText {
  title: string;
  body: string;
}

export const BACKUP_BENEFITS: readonly TitledText[] = [
  {
    title: "Charge from a generator",
    body: "With a compatible generator and the optional aGate Generator Module, your system can replenish battery reserve during longer outages.",
  },
  {
    title: "Prepare before severe weather",
    body: "Enable Storm Hedge in the FranklinWH App to charge batteries when supported National Weather Service alerts reach your location.",
  },
  {
    title: "Choose which circuits stay on",
    body: "The optional Smart Circuits Module lets you control selected circuits and preserve reserve for the essentials.",
  },
];

export interface ProductModel {
  name: string;
  body: string;
}

export const PRODUCT_MODELS: readonly ProductModel[] = [
  {
    name: "aGate",
    body: "The controller coordinating energy from solar, grid, batteries and compatible generators.",
  },
  {
    name: "aPower S",
    body: "15\u00a0kWh of storage with an integrated solar inverter for direct panel connection.",
  },
  {
    name: "aPower 2",
    body: "15\u00a0kWh of AC\u2011coupled storage for an existing solar system or a new build.",
  },
  {
    name: "aPower X",
    body: "FranklinWH’s 13.6\u00a0kWh AC\u2011coupled battery platform.",
  },
];

export const PROCESS_STEPS: readonly TitledText[] = [
  { title: "Design around your loads", body: "We size backup for the appliances you want to keep running." },
  { title: "Permits and installation", body: "We manage approvals, and our licensed team does the work." },
  { title: "Support after installation", body: "Our in‑house team handles warranty support." },
];

export interface Testimonial {
  quote: string;
  author: string;
}

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote: "They were professional, extremely knowledgeable, and quick to respond to any question I had. The quality of their work is excellent.",
    author: "Tim",
  },
  {
    quote: "They have to be the best in the business in Northern Michigan and the U.P. … I am very happy with their performance and the end\u00a0result!",
    author: "Kent",
  },
  {
    quote: "The team took the time in assisting us in understanding the system and what we needed, performed exceptional installation, and after sales support is second to none.",
    author: "Keith",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: readonly FaqItem[] = [
  {
    question: "What will my project proposal include?",
    answer: "You’ll receive equipment specifications, a system design, estimated energy production and warranty information.",
  },
  {
    question: "Which checks happen before activation?",
    answer: "We coordinate final inspections with local authorities and, for grid-connected systems, your utility before activating the system.",
  },
  {
    question: "Will the batteries work through a Northern Michigan\u00a0winter?",
    answer: "Yes. FranklinWH batteries have integrated heating and cooling that protects them in extreme temperatures, so they keep performing through Midwest winters and longer\u00a0outages.",
  },
];

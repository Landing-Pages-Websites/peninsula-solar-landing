// Policy text for /privacy. It lists exactly the six fields the quote form collects.
// Written for the customer to review; no SMS section because the form collects no SMS consent.

export interface PolicySection {
  heading: string;
  paragraphs: readonly string[];
  items?: readonly string[];
}

export const POLICY_EFFECTIVE_DATE = "November 19, 2026";

export const POLICY_SECTIONS: readonly PolicySection[] = [
  {
    heading: "Who we are",
    paragraphs: [
      "Peninsula Solar (“we”, “us”) designs and installs solar and energy storage systems for Northern Michigan. This policy explains how we handle information collected through our quote request pages on call.peninsula-solar.com.",
    ],
  },
  {
    heading: "Information you give us",
    paragraphs: ["When you request a quote, the form asks for:"],
    items: [
      "Full name (required)",
      "Phone number (required)",
      "Email address (optional)",
      "Utility company (optional)",
      "Whether you are interested in off-grid or battery backup (optional)",
      "Any message you choose to include (optional)",
    ],
  },
  {
    heading: "Information collected automatically",
    paragraphs: [
      "When you visit these pages, we and our service providers collect the page address, the page that referred you, advertising campaign details in the link you followed (such as UTM parameters and ad click identifiers), and browser identifiers we store on your device to recognise a visit and session. We also use cookies and similar technologies for analytics and advertising, including Google tags, and a call tracking service that records details of calls placed from these pages, such as the time and length of the call and the calling number.",
    ],
  },
  {
    heading: "How we use information",
    paragraphs: ["We use this information to:"],
    items: [
      "Respond to your inquiry and contact you about your project",
      "Prepare quotes, system designs and project estimates",
      "Understand which pages and advertisements lead to inquiries, and improve them",
      "Keep records of our communications with you",
    ],
  },
  {
    heading: "Sharing with service providers",
    paragraphs: [
      "We share information with companies that help us run these pages and follow up on inquiries, such as website hosting, lead management, analytics, advertising and call tracking providers. They process it on our behalf. We may also disclose information when the law requires it or to protect our rights.",
    ],
  },
  {
    heading: "Cookies and advertising choices",
    paragraphs: [
      "You can block or delete cookies in your browser settings, and you can manage how Google personalises ads in your Google account’s ad settings. Blocking cookies does not stop you from requesting a quote.",
    ],
  },
  {
    heading: "Security and retention",
    paragraphs: [
      "We use reasonable safeguards to protect the information we receive. We keep it for as long as we need it to respond to you, carry out a project, and meet our legal and accounting obligations.",
    ],
  },
  {
    heading: "Your choices",
    paragraphs: [
      "You may ask us to access, correct or delete the information you submitted by emailing us at the address below. These pages are not intended for children under 13, and we do not knowingly collect their information.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: ["If we change this policy, we will post the updated version on this page with a new effective date."],
  },
];

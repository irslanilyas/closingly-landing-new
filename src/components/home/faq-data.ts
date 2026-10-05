/** The FAQ, shared by the accordion and the FAQPage structured data. */
export const FAQS: { q: string; a: string; privacyLink?: boolean }[] = [
  {
    q: "What is Closingly?",
    a: "Closingly is an AI sales assistant for people who sell their own work. It joins your client calls, then drafts the proposal, recommends a price based on your own past deals, keeps the deal on your pipeline and tells you when to follow up.",
  },
  {
    q: "What integrations do I need?",
    a: "A Google account with your calendar. The Closingly notetaker joins calls on Google Meet, Zoom and Microsoft Teams. Recorded a call somewhere else? Paste the transcript in and you get the same results.",
  },
  {
    q: "Who is Closingly for?",
    a: "Freelancers, consultants, agencies, coaches and service businesses who take sales calls and send proposals afterwards.",
  },
  {
    q: "Is the founding beta free?",
    a: "Yes. Founding beta members get free access, early access to new features, priority support and a direct say in what we build next.",
  },
  {
    q: "Does the AI make decisions or send follow-ups for me?",
    a: "No. Closingly drafts, you decide. Proposals, prices and follow-ups are suggestions you review, edit and send yourself. Nothing reaches a client without your say.",
  },
  {
    q: "Will everyone on the call know it’s being recorded?",
    a: "Yes. The Closingly notetaker joins as a visible participant, and only on the calls you switch on. Nothing is ever recorded in secret.",
  },
  {
    q: "How do you handle user data?",
    a: "Your data stays yours. Every account is isolated at the database level, everything is encrypted in transit and at rest, and we never sell your data or use it to train AI models. You can export or delete your account at any time. The full details are in our",
    privacyLink: true,
  },
];

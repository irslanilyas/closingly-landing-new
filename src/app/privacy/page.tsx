import { LegalPage } from "@/components/legal/LegalPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy Policy | Closingly",
  description:
    "How Closingly collects, uses, shares and protects your information, including data from Google, your recorded calls and the founding beta waitlist.",
});

export default function PrivacyPage() {
  return <LegalPage doc="privacy" />;
}

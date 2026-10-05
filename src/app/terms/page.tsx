import { LegalPage } from "@/components/legal/LegalPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  path: "/terms",
  title: "Terms of Service | Closingly",
  description: "The terms for using Closingly, the AI sales assistant that turns client calls into proposals, prices and follow-ups.",
});

export default function TermsPage() {
  return <LegalPage doc="terms" />;
}

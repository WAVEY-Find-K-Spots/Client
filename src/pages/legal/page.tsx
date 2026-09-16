import { Navigate, useNavigate, useParams } from "react-router-dom";
import type { LegalDocumentType } from "@/lib/legal-documents-api";
import StaticDocView from "@/pages/mypage/components/StaticDocView";

const DOCUMENT_TYPES: Record<string, LegalDocumentType> = {
  terms: "TERMS",
  privacy: "PRIVACY",
};

export default function LegalDocumentPage() {
  const navigate = useNavigate();
  const { type = "" } = useParams();
  const documentType = DOCUMENT_TYPES[type];

  if (!documentType) {
    return <Navigate to="/login" replace />;
  }

  return <StaticDocView documentType={documentType} onBack={() => navigate(-1)} />;
}

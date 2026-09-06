import StatusBar from "@/components/layout/StatusBar";
import SubHeader from "./SubHeader";
import type { DocSection } from "./legalDocs";

interface StaticDocViewProps {
  title: string;
  updatedAt: string;
  sections: DocSection[];
  onBack: () => void;
}

export default function StaticDocView({
  title,
  updatedAt,
  sections,
  onBack,
}: StaticDocViewProps) {
  return (
    <div className="min-h-full bg-page">
      <StatusBar variant="dark" />
      <SubHeader title={title} onBack={onBack} />

      <div className="px-6 mt-5">
        <p className="text-[11px] text-muted">최종 업데이트 {updatedAt}</p>
        <div className="mt-4 flex flex-col gap-5">
          {sections.map((s) => (
            <section key={s.heading}>
              <h3 className="text-[14px] font-semibold text-ink">{s.heading}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-sub whitespace-pre-line">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      </div>

      <div className="h-24" />
    </div>
  );
}


import { Flag } from "@/components/ui/flag";

export default function FlagPage() {
  return (
    <div className="flex flex-row justify-center gap-8">
      <Flag code="HU" className="size-16" />
      <Flag code="DE" className="size-16" />
      <Flag code="GB" className="size-16" />
      <Flag code="ES" className="size-16" />
      <Flag code="CN" className="size-16" />
    </div>
  );
}

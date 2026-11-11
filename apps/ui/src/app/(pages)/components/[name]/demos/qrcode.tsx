import Logo from "@/components/blocks/logo";

// START
import QrCode from "@/components/ui/qrcode";

export default function LoadingDemo() {
  return (
    <div className="py-4 max-w-xs w-full mx-auto">
      <QrCode
        text="https://example.com"
        logoRatio={0.3}
        className="size-50 text-accent bg-accent-foreground"
      >
        <Logo variant="icon" />
      </QrCode>
    </div>
  );
}
// END

export const keywords = [
  "shadcn",
  "base ui",
  "react",
  "component",
  "qrcode",
  "scan",
  "logo",
];

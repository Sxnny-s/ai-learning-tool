import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Tutor",
  description: "Interactive AI models and demos powered by AI Tutor",

  
};

export default function HuggingFacePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
             AI Tutor
            </h1>
            <p className="text-muted-foreground">
              stuck in a coding problem or need help finding the bug? paste your code and I will help guide you through the solution.
            </p>
          </div>
          <Link
            href="/"
            className="text-primary hover:text-primary/80 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="h-[calc(100vh-120px)] p-4">
        <div className="h-full w-full max-w-7xl mx-auto">
          <iframe
            src="https://drixo-rccopilot.hf.space"
            className="w-full h-full border-0 rounded-lg shadow-lg"
            title="AI Tutor"
            allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; display-capture; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; wake-lock; screen-wake-lock; web-share; xr-spatial-tracking"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
          />
        </div>
      </main>
    </div>
  );
}

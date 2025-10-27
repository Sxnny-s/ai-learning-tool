"use client";

import { useState } from "react";

interface HuggingFaceProps {
  /** The Hugging Face Space URL */
  src?: string;
  /** Optional title displayed above the iframe */
  title?: string;
  /** Optional height for the iframe */
  height?: string;
}

function HuggingFace({
  src = "https://drixo-rccopilot.hf.space",
  title = "Practice Tutor",
  height = "500px",
}: HuggingFaceProps) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="w-full space-y-2">
      {title && (
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      )}

      <div className="relative w-full rounded-lg shadow-md border border-border overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground animate-pulse">
            Loading {title}...
          </div>
        )}

        <iframe
          src={src}
          className="w-full border-0 rounded-lg"
          style={{ height }}
          title={title}
          onLoad={() => setLoading(false)}
          allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; display-capture; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; wake-lock; screen-wake-lock; web-share; xr-spatial-tracking"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
        />
      </div>
    </div>
  );
}
export default HuggingFace;
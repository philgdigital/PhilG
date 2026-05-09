import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Phil G. · Senior UX/UI Product Design Leader · AI-Native";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0a0a0c",
          backgroundImage:
            "radial-gradient(ellipse at top left, rgba(15,98,254,0.45), transparent 55%), radial-gradient(ellipse at bottom right, rgba(15,98,254,0.18), transparent 60%)",
          color: "#f4f4f5",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            display: "flex",
            alignItems: "center",
          }}
        >
          PG<span style={{ color: "#0f62fe", marginLeft: 4 }}>®</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#71717a",
            }}
          >
            Senior UX/UI Product Design Leader · Prague · AI-Native
          </div>
          <div
            style={{
              fontSize: 110,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Design</span>
            <span
              style={{
                background:
                  "linear-gradient(90deg, #f4f4f5 0%, #4589ff 33%, #34d399 66%, #f4f4f5 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Acceleration
            </span>
            <span style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 300,
                  fontStyle: "italic",
                  color: "#71717a",
                  textTransform: "lowercase",
                }}
              >
                with
              </span>
              <span>AI.</span>
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#a1a1aa",
          }}
        >
          <span>Walmart · VMware · Microsoft · SAP · WWF · Cemex · Vodafone</span>
          <span style={{ color: "#0f62fe" }}>● Available 2026</span>
        </div>
      </div>
    ),
    { ...size },
  );
}

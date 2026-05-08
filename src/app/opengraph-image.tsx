import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Phil G. — Architecting Enterprise Velocity";
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
          background: "#030305",
          backgroundImage:
            "radial-gradient(ellipse at top left, rgba(79,70,229,0.45), transparent 50%), radial-gradient(ellipse at bottom right, rgba(34,211,238,0.35), transparent 50%), radial-gradient(ellipse at center, rgba(168,85,247,0.25), transparent 60%)",
          color: "#ffffff",
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
          PG<span style={{ color: "#818cf8", marginLeft: 4 }}>®</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#a5f3fc",
            }}
          >
            Architecting Enterprise Velocity
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
                  "linear-gradient(90deg, #818cf8 0%, #ffffff 50%, #22d3ee 100%)",
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
                  color: "#737373",
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
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#a3a3a3",
          }}
        >
          <span>Phil G. — Enterprise Product Lead</span>
          <span style={{ color: "#34d399" }}>● Available 2026</span>
        </div>
      </div>
    ),
    { ...size },
  );
}

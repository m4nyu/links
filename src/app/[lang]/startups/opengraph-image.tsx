import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Startups"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        position: "relative",
      }}
    >
      {/* Subtle background pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)
            `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          position: "relative",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#09090b",
            margin: 0,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          Startups
        </h1>

        <p
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: "#71717a",
            margin: 0,
            letterSpacing: "0.02em",
          }}
        >
          by Manuel
        </p>
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: "25%",
          right: "25%",
          height: 2,
          background: "linear-gradient(to right, transparent, #e5e5e5, transparent)",
        }}
      />
    </div>,
    {
      ...size,
    }
  )
}

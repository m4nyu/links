import { ImageResponse } from "next/og"

export const alt = "Manuel - Founder & Engineer"
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
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        position: "relative",
      }}
    >
      {/* Fractal-inspired background overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(102,126,234,0.3) 0%, transparent 50%)
          `,
        }}
      />

      {/* Main Content Card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          position: "relative",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          padding: "60px 80px",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Profile Image Placeholder */}
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            fontWeight: 700,
            color: "white",
            border: "4px solid white",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
          }}
        >
          M
        </div>

        {/* Name and Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <h1
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#09090b",
              margin: 0,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            Manuel
          </h1>

          <p
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "#71717a",
              margin: 0,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Founder & Engineer
          </p>
        </div>

        {/* Button Previews */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 8,
          }}
        >
          <div
            style={{
              padding: "12px 32px",
              border: "2px solid #09090b",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              color: "#09090b",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Blog
          </div>
          <div
            style={{
              padding: "12px 32px",
              background: "#09090b",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              color: "white",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Schedule Meeting
          </div>
        </div>

        {/* Social Icons Representation */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 8,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: 44,
                height: 44,
                border: "2px solid #09090b",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              {i === 4 ? "↗" : "◉"}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom URL indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          fontSize: 18,
          color: "rgba(255, 255, 255, 0.9)",
          fontWeight: 500,
        }}
      >
        m4nuel.com
      </div>
    </div>,
    {
      ...size,
    }
  )
}

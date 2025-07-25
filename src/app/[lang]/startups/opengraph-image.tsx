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
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <h1
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: "#09090b",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Startups
          </h1>
          
          <p
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: "#71717a",
              margin: 0,
            }}
          >
            by Manuel
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

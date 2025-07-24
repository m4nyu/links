import { ImageResponse } from "next/og"

export const size = {
  width: 32,
  height: 32,
}

export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Portfolio icon</title>
        <rect x="3" y="3" width="18" height="18" rx="0" stroke="#000" strokeWidth="2" fill="none" />
      </svg>
    </div>,
    {
      ...size,
    }
  )
}

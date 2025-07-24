import { ImageResponse } from "next/og"

export const alt = "Manuel - Portfolio"
export const contentType = "image/png"

export default async function Image() {

  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
  const avatarUrl = `${baseUrl}/placeholder.svg?height=256&width=256`

  const background = "bg-zinc-950"
  const textColor = "text-zinc-50"
  const subtitleColor = "text-zinc-400"
  const gridColor = "rgba(255,255,255,0.07)"

  return new ImageResponse(
    <div
      tw={`relative flex h-full w-full flex-col items-center justify-center ${background} ${textColor}`}
    >
      <div
        tw="absolute top-0 left-0 right-0 bottom-0 opacity-50"
        style={{
          backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: "3rem 3rem",
        }}
      />
      <img
        src={avatarUrl || "/placeholder.svg"}
        alt="Manuel Avatar"
        width="256"
        height="256"
        tw="border-8 border-zinc-50"
      />
      <h1 tw="mt-8 mb-2 text-center text-[80px] font-semibold leading-[1.1]">Manuel</h1>
      <p tw={`m-0 text-center text-[40px] font-normal ${subtitleColor}`}>Founder & Engineer</p>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [],
    },
  )
}

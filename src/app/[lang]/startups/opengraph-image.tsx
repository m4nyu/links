import { ImageResponse } from "next/og"

export const alt = "Manuels Startups"
export const contentType = "image/png"

export default async function Image() {

  const background = "bg-zinc-50"
  const textColor = "text-zinc-900"
  const subtitleColor = "text-zinc-500"
  const gridColor = "rgba(0,0,0,0.05)"

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
      <div tw="flex items-center justify-center rounded-full bg-zinc-900 p-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="96"
          height="96"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgb(250 250 250)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>
      <h1 tw="mt-8 mb-2 text-center text-[80px] font-semibold leading-[1.1]">My Startups</h1>
      <p tw={`m-0 text-center text-[40px] font-normal ${subtitleColor}`}>Projects by Manuel</p>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [],
    },
  )
}

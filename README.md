<div style="text-align: center;">

<pre style="background: transparent;">
██╗     ██╗███╗   ██╗██╗  ██╗███████╗
██║     ██║████╗  ██║██║ ██╔╝██╔════╝
██║     ██║██╔██╗ ██║█████╔╝ ███████╗
██║     ██║██║╚██╗██║██╔═██╗ ╚════██║
███████╗██║██║ ╚████║██║  ██╗███████║
╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
</pre>
[![GitHub](https://img.shields.io/badge/GitHub-m4nyu-181717?style=flat&logo=github)](https://github.com/m4nyu)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Manuel%20Szedlak-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/manuel-szedlak)
[![X](https://img.shields.io/badge/X-ManuelSzedlak-1DA1F2?style=flat&logo=x)](https://x.com/ManuelSzedlak)

![Next.js](https://img.shields.io/badge/Next.js-15.5.0-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

</div>

## ▲ Installation

```bash
# Install Node.js (18.x or higher)
node --version  # Verify installation
npm install     # Install dependencies
```

## ▶ Run

```bash
npm run dev     # Development server at http://localhost:3000
npm run build   # Production build
npm run start   # Production server
```

## ▲ Deploy

### Deploy to Vercel

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Select the `main` branch

2. **Configure Build Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

3. **Set Environment Variables** (if needed)
   ```
   NEXT_PUBLIC_API_URL=your-api-url
   ```

4. **Deploy**
   - Click "Deploy" and wait for the build
   - Your site will be available at `https://[app-name].vercel.app`

## ■ Adding Content

Create new pages and components in the `src/` directory:

```tsx
// src/app/[lang]/page.tsx
export default function Page() {
  return <div>Your content here</div>
}
```

### MDX Support
```mdx
---
title: "Page Title"
description: "Page description"
---

# Content with React components

<Button>Interactive button</Button>
```

### Internationalization
- 10 languages supported out of the box
- Add translations in `src/content/`
- Automatic locale detection and routing

## ◆ Structure

```
src/
├── app/                 # Next.js App Router
│   ├── [lang]/         # Internationalized routes
│   └── api/            # API endpoints
├── components/         # Reusable UI components
├── content/           # MDX content & translations
├── lib/               # Utilities and configurations
└── styles/            # Global styles & Tailwind

public/                # Static assets & images
```
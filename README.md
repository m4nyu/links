<div align="center">
  <h1>Portfolio</h1>
  <img src="public/image.jpg" alt="Portfolio" width="200" />
  <h3>Dependencies</h3>
  <p>
    <img src="https://img.shields.io/badge/next-white?style=flat-square&labelColor=fff&color=fff&logoColor=000" alt="next" />
    <img src="https://img.shields.io/badge/react-white?style=flat-square&labelColor=fff&color=fff&logoColor=000" alt="react" />
    <img src="https://img.shields.io/badge/typescript-white?style=flat-square&labelColor=fff&color=fff&logoColor=000" alt="typescript" />
    <img src="https://img.shields.io/badge/tailwindcss-white?style=flat-square&labelColor=fff&color=fff&logoColor=000" alt="tailwindcss" />
    <img src="https://img.shields.io/badge/@radix--ui-white?style=flat-square&labelColor=fff&color=fff&logoColor=000" alt="@radix-ui" />
    <img src="https://img.shields.io/badge/@mdx--js-white?style=flat-square&labelColor=fff&color=fff&logoColor=000" alt="@mdx-js" />
    <img src="https://img.shields.io/badge/framer--motion-white?style=flat-square&labelColor=fff&color=fff&logoColor=000" alt="framer-motion" />
    <img src="https://img.shields.io/badge/next--themes-white?style=flat-square&labelColor=fff&color=fff&logoColor=000" alt="next-themes" />
    <img src="https://img.shields.io/badge/cal.com-white?style=flat-square&labelColor=fff&color=fff&logoColor=000" alt="cal.com" />
    <img src="https://img.shields.io/badge/jotai-white?style=flat-square&labelColor=fff&color=fff&logoColor=000" alt="jotai" />
  </p>
</div>

<div id="setup" style="position: sticky; top: 0; display: flex; align-items: center; padding: 14px 16px; backdrop-filter: blur(10px); background-color: rgba(0, 0, 0, 0.75); margin: 30px 0 20px 0; color: #ffffff; font-weight: 500; font-size: 16px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); z-index: 50;"><span style="margin-right: 10px;"></span><span>Setup</span></div>

<div class="subnavigation" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; padding-left: 10px;">
  <a href="#environment" style="display: inline-block; padding: 5px 0; text-decoration: none; color: #333; font-size: 13px; transition: all 0.2s ease; border-bottom: 1px solid transparent; margin-right: 16px;">Environment</a>
  <a href="#dependencies" style="display: inline-block; padding: 5px 0; text-decoration: none; color: #333; font-size: 13px; transition: all 0.2s ease; border-bottom: 1px solid transparent; margin-right: 16px;">Dependencies</a>
</div>

### <a id="environment"></a>Environment

```bash
node --version  # Should be 18.x or higher
npm --version
git clone <repository>
cd manuel-site
npm install
```

### <a id="dependencies"></a>Dependencies

| Action | Command |
|--------|---------|
| Install | `npm install` |
| Add package | `npm install package-name` |
| Add dev package | `npm install -D package-name` |
| Update packages | `npm update` |
| Clean install | `rm -rf node_modules package-lock.json && npm install` |

<div id="development" style="position: sticky; top: 0; display: flex; align-items: center; padding: 14px 16px; backdrop-filter: blur(10px); background-color: rgba(0, 0, 0, 0.75); margin: 30px 0 20px 0; color: #ffffff; font-weight: 500; font-size: 16px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); z-index: 50;"><span style="margin-right: 10px;"></span><span>Development</span></div>

<div class="subnavigation" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; padding-left: 10px;">
  <a href="#servers" style="display: inline-block; padding: 5px 0; text-decoration: none; color: #333; font-size: 13px; transition: all 0.2s ease; border-bottom: 1px solid transparent; margin-right: 16px;">Servers</a>
  <a href="#code-quality" style="display: inline-block; padding: 5px 0; text-decoration: none; color: #333; font-size: 13px; transition: all 0.2s ease; border-bottom: 1px solid transparent; margin-right: 16px;">Code Quality</a>
</div>

### <a id="servers"></a>Servers

| Server | Command |
|--------|---------|
| Development | `npm run dev` |
| Production Build | `npm run build` |
| Production Server | `npm run start` |

### <a id="code-quality"></a>Code Quality

| Tool | Command |
|------|---------|
| Linting | `npm run lint` |
| Type Checking | `npm run type-check` |

<div id="features" style="position: sticky; top: 0; display: flex; align-items: center; padding: 14px 16px; backdrop-filter: blur(10px); background-color: rgba(0, 0, 0, 0.75); margin: 30px 0 20px 0; color: #ffffff; font-weight: 500; font-size: 16px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); z-index: 50;"><span style="margin-right: 10px;"></span><span>Features</span></div>

<div class="subnavigation" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; padding-left: 10px;">
  <a href="#internationalization" style="display: inline-block; padding: 5px 0; text-decoration: none; color: #333; font-size: 13px; transition: all 0.2s ease; border-bottom: 1px solid transparent; margin-right: 16px;">Internationalization</a>
  <a href="#ui-components" style="display: inline-block; padding: 5px 0; text-decoration: none; color: #333; font-size: 13px; transition: all 0.2s ease; border-bottom: 1px solid transparent; margin-right: 16px;">UI Components</a>
  <a href="#content-management" style="display: inline-block; padding: 5px 0; text-decoration: none; color: #333; font-size: 13px; transition: all 0.2s ease; border-bottom: 1px solid transparent; margin-right: 16px;">Content</a>
</div>

### <a id="internationalization"></a>Internationalization

- **10 Languages Supported**: English, German, Spanish, French, Portuguese (BR), Russian, Chinese, Japanese, Hindi, Arabic
- **Dynamic Language Switching**: Automatic locale detection and routing
- **Localized Content**: Full translation support for all site content

### <a id="ui-components"></a>UI Components

- **Modern Design System**: Built with Tailwind CSS v4
- **Radix UI Components**: Accessible, unstyled UI primitives
- **Theme Support**: Dark/light mode with next-themes
- **Animations**: Framer Motion for smooth interactions
- **Responsive Design**: Mobile-first approach

### <a id="content-management"></a>Content Management

- **MDX Support**: Rich content with React components
- **Legal Pages**: Imprint and privacy policy templates
- **Dynamic Routing**: Internationalized page routing
- **Meeting Integration**: Cal.com embed for scheduling

<div id="architecture" style="position: sticky; top: 0; display: flex; align-items: center; padding: 14px 16px; backdrop-filter: blur(10px); background-color: rgba(0, 0, 0, 0.75); margin: 30px 0 20px 0; color: #ffffff; font-weight: 500; font-size: 16px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); z-index: 50;"><span style="margin-right: 10px;"></span><span>Architecture</span></div>

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Jotai for atomic state
- **Content**: MDX with @mdx-js/react
- **Icons**: Phosphor Icons and Lucide React
- **Deployment**: Optimized for modern hosting platforms

### Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── [lang]/         # Internationalized routes
│   └── api/            # API endpoints
├── components/         # Reusable UI components
├── content/           # MDX content files
├── lib/               # Utilities and configurations
└── styles/            # Global styles
```

<style>
.subnavigation a {
  color: #ffffff !important;
  font-weight: 500 !important;
  font-size: 14px !important;
}

.subnavigation a:hover {
  border-bottom-color: #ffffff !important;
  transition: all 0.2s ease !important;
}
</style>
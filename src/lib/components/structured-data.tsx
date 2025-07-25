export function PersonStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Manuel",
    "jobTitle": "Founder & Engineer", 
    "description": "Founder and engineer. Portfolio and contact information.",
    "url": "https://manuel.site",
    "sameAs": [
      "https://github.com/manuel-lambda",
      "https://www.linkedin.com/in/manuel-szedlak",
      "https://x.com/ManuelSzedlak"
    ],
    "knowsAbout": [
      "Software Engineering",
      "Entrepreneurship", 
      "Web Development",
      "Startups"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Manuel",
    "url": "https://manuel.site",
    "description": "Founder and engineer. Portfolio and contact information.",
    "author": {
      "@type": "Person",
      "name": "Manuel"
    },
    "inLanguage": ["en", "de", "es", "fr", "zh-CN", "ja", "pt-BR", "ru", "hi", "ar"]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
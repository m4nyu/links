export function PersonStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Manuel",
    "alternateName": "Manuel Szedlak",
    "jobTitle": "Founder & Engineer",
    "description": "Founder and engineer. Portfolio and contact information.",
    "url": "https://m4nuel.com",
    "image": "https://m4nuel.com/image.jpg",
    "sameAs": [
      "https://github.com/manuel-lambda",
      "https://www.linkedin.com/in/manuel-szedlak",
      "https://x.com/ManuelSzedlak"
    ],
    "knowsAbout": [
      "Software Engineering",
      "Entrepreneurship",
      "Full-stack Development", 
      "Web Development",
      "Startup Founding",
      "Product Development"
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "Independent"
    }
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
    "name": "Manuel - Portfolio",
    "alternateName": "Manuel Szedlak Portfolio",
    "url": "https://m4nuel.com",
    "description": "Founder and engineer. Portfolio and contact information.",
    "author": {
      "@type": "Person",
      "name": "Manuel",
      "alternateName": "Manuel Szedlak"
    },
    "publisher": {
      "@type": "Person", 
      "name": "Manuel"
    },
    "inLanguage": ["en", "de", "es", "fr", "zh-CN", "ja", "pt-BR", "ru", "hi", "ar"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://m4nuel.com/{search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
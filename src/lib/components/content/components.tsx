import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/lib/components/ui/alert'
import { Badge } from '@/lib/components/ui/badge'
import { Button } from '@/lib/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'
import { Separator } from '@/lib/components/ui/separator'

const MDXCard = ({ title, description, className, children, ...props }: {
  title?: string
  description?: string
  className?: string
  children?: React.ReactNode
} & React.ComponentProps<typeof Card>) => (
  <Card className={cn('my-3', className)} {...props}>
    {(title || description) && (
      <CardHeader className="p-4 pb-3">
        {title && <CardTitle className="text-xl font-bold">{title}</CardTitle>}
        {description && <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>}
      </CardHeader>
    )}
    {children && <CardContent className="px-4 pt-3 pb-4 text-sm [&>*:last-child]:mb-0 [&>*:first-child]:mt-0">{children}</CardContent>}
  </Card>
)

const MDXAlert = ({ type = 'default', title, className, children, ...props }: {
  type?: 'default' | 'destructive' | 'info' | 'warning' | 'success'
  title?: string
  className?: string
  children?: React.ReactNode
} & React.ComponentProps<typeof Alert>) => {
  const variantStyles = {
    default: '',
    info: '[&>svg]:text-primary',
    warning: '[&>svg]:text-yellow-600',
    success: '[&>svg]:text-green-600',
    destructive: ''
  }
  
  return (
    <Alert 
      className={cn('my-4', variantStyles[type], className)}
      variant={type === 'destructive' ? 'destructive' : 'default'}
      {...props}
    >
      {title && <AlertTitle className="text-sm font-medium">{title}</AlertTitle>}
      {children && <AlertDescription className="text-sm text-muted-foreground [&>*:last-child]:mb-0">{children}</AlertDescription>}
    </Alert>
  )
}

const MDXCallout = ({ type = 'note', title, className, children }: {
  type?: 'note' | 'tip' | 'important' | 'warning' | 'caution' | 'info'
  title?: string
  className?: string
  children?: React.ReactNode
}) => {
  const styles = {
    note: 'border-l-4 border-border bg-muted/50',
    info: 'border-l-4 border-primary bg-primary/5',
    tip: 'border-l-4 border-green-600 bg-green-500/10',
    important: 'border-l-4 border-purple-600 bg-purple-500/10',
    warning: 'border-l-4 border-yellow-600 bg-yellow-500/10',
    caution: 'border-l-4 border-destructive bg-destructive/10'
  }

  return (
    <div className={cn('p-4 my-4', styles[type], className)}>
      {title && <div className="text-sm font-medium mb-1">{title}</div>}
      <div className="text-sm [&>*:last-child]:mb-0">
        {children}
      </div>
    </div>
  )
}

export const mdxComponents = {
  Card: MDXCard,
  Alert: MDXAlert,
  Callout: MDXCallout,
  Badge,
  Button,
  Separator,
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-2xl font-bold mb-4" {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-xl font-bold mb-3 mt-6" {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-base font-semibold mb-2 mt-4" {...props} />,
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h4 className="text-sm font-semibold mb-2 mt-3" {...props} />,
  h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h5 className="text-sm font-medium mb-1" {...props} />,
  h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h6 className="text-xs font-medium mb-1" {...props} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="text-sm leading-relaxed mb-3" {...props} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="my-3 ml-4 list-disc space-y-1" {...props} />,
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="my-3 ml-4 list-decimal space-y-1" {...props} />,
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li className="text-sm" {...props} />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const href = props.href
    const isInternalLink = href && (href.startsWith('/') || href.startsWith('#'))
    const isMailto = href && href.startsWith('mailto:')
    const isProtocolLink = href && (href.startsWith('http://') || href.startsWith('https://'))
    
    if (isInternalLink && !href.startsWith('#')) {
      return (
        <Link 
          href={href} 
          className="text-primary underline-offset-2 hover:underline"
          {...props}
        />
      )
    }
    
    if (isProtocolLink || isMailto) {
      return (
        <a 
          className="text-primary underline-offset-2 hover:underline" 
          {...props}
          {...(isProtocolLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        />
      )
    }
    
    return <a className="text-primary underline-offset-2 hover:underline" {...props} />
  },
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => <blockquote className="border-l-4 border-border pl-4 my-4 italic text-sm text-muted-foreground" {...props} />,
  code: (props: React.HTMLAttributes<HTMLElement>) => <code className="bg-muted px-1 py-0.5 font-mono text-xs" {...props} />,
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => <pre className="my-4 overflow-x-auto p-4 bg-muted text-xs" {...props} />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong className="font-semibold" {...props} />,
  em: (props: React.HTMLAttributes<HTMLElement>) => <em className="italic" {...props} />,
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => <hr className="my-4 border-border" {...props} />,
}
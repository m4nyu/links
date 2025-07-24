'use client'

import React from 'react'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { mdxComponents } from './components'

interface MDXRendererProps {
  source: MDXRemoteSerializeResult
  className?: string
}

export const MDXRenderer: React.FC<MDXRendererProps> = ({ source, className }) => (
  <div className={className}>
    <MDXRemote {...source} components={mdxComponents} />
  </div>
)
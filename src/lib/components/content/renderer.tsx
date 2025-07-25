"use client"

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote"
import type React from "react"
import { mdxComponents } from "./components"

interface MDXRendererProps {
  source: MDXRemoteSerializeResult
  className?: string
}

export const MDXRenderer: React.FC<MDXRendererProps> = ({ source, className }) => (
  <div className={className}>
    <MDXRemote {...source} components={mdxComponents} />
  </div>
)

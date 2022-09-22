import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { BodyShort } from '@navikt/ds-react'

/**
 * singleWord true remove paragraph wrapper for content
 */
export const Markdown = ({ singleWord, escapeHtml = true, verbatim, source }: { source: string; escapeHtml?: boolean; singleWord?: boolean; verbatim?: boolean }) => {
  const renderers = {
    p: (parProps: any) => (singleWord ? <React.Fragment {...parProps} /> : verbatim ? <p {...parProps} /> : <BodyShort {...parProps} />),
  }

  const htmlPlugins = escapeHtml ? [] : [rehypeRaw]
  return <ReactMarkdown children={source} components={renderers} linkTarget="_blank" remarkPlugins={[remarkGfm]} rehypePlugins={htmlPlugins} />
}

import { BodyShort } from '@navikt/ds-react'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

/**
 * singleWord true remove paragraph wrapper for content
 */
export const Markdown = ({ singleWord, escapeHtml = true, verbatim, source }: { source: string; escapeHtml?: boolean; singleWord?: boolean; verbatim?: boolean }) => {
  const renderers = {
    p: (paragraphProperties: any) => (singleWord ? <React.Fragment {...paragraphProperties} /> : (verbatim ? <p {...paragraphProperties} /> : <BodyShort {...paragraphProperties} />)),
  }

  const htmlPlugins = escapeHtml ? [] : [rehypeRaw]
  return <ReactMarkdown children={source} components={renderers} linkTarget="_blank" rehypePlugins={htmlPlugins} remarkPlugins={[remarkGfm]} />
}

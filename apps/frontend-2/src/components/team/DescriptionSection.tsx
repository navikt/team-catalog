import { css } from "@emotion/css"
import { BodyShort, Heading } from "@navikt/ds-react"

const Divider = () => (
    <div className={css`height: 5px; background: #005077; margin-bottom: 1rem; `}></div>
)

type DescriptionSectionProps = {
    text: React.ReactNode
}

const DescriptionSection = (props: DescriptionSectionProps) => {
    const { text } = props

    return (
        <div>
            <Heading size="medium" className={css`font-size: 22px; font-weight: 600;`}>Om oss</Heading>
            <Divider />
            <BodyShort>{text}</BodyShort>
        </div>
    )
}

export default DescriptionSection
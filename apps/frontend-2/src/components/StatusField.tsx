import { css } from "@emotion/css"
import { Label } from "@navikt/ds-react"
import { Status } from "../constants"
import { intl } from "../util/intl/intl"

const getStyling = (status: Status) => {
    let backgroundColor = '#FFFFFF'
    let borderColor = '#007C2E'

    if (status === Status.PLANNED) {
        backgroundColor = '#E0D8E9'
        borderColor = '#634689'
    }
    else if (status === Status.INACTIVE) {
        backgroundColor = '#F9D2CC'
        borderColor = '#BA3A26'
    }

    return {
        div: css`
            background-color: ${backgroundColor};
            width: 110px;
            border: 1px solid ${borderColor};
            border-radius: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
            max-height: 40px;
            `,
        dot: css`
            width: 10px;
            height: 10px;
            background-color: ${borderColor};
            margin-right: 5px;
            border-radius: 5px;
        `
    }
}

type StatusProps = {
    status: Status
}

const StatusField = (props: StatusProps) =>  {

    return (
        <div className={getStyling(props.status).div}>
            <div className={getStyling(props.status).dot}></div>
            <Label size="medium" className={css`font-weight: 700px; font-size: 16px;`}>{intl[props.status]}</Label>
        </div>
    )
}

export default StatusField
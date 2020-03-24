import * as React from 'react'
import { H4 } from 'baseui/typography'
import ListView from '../components/common/ListView'
import { ProductTeam, ProductTeamFormValues, ProductArea } from '../constants'
import { getAllTeams } from '../api/teamApi'
import { Block } from 'baseui/block'
import Button from '../components/common/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import ModalTeam from '../components/Team/ModalTeam'
import { getAllProductAreas } from '../api'
import { Option } from 'baseui/select'

let initialValues = {
    name: '',
    description: '',
    productAreaId: '',
    naisTeams: [],
    members: []
} as ProductTeamFormValues

const TeamListPage = () => {
    const [teamList, setTeamList] = React.useState<ProductTeam[]>([])
    const [showModal, setShowModal] = React.useState<boolean>(false)
    const [productAreas, setProductAreas] = React.useState<Option[]>([])

    const handleSubmit = (values: ProductTeamFormValues) => {
        console.log("Values submitted", values)
    }

    const mapToOptions = (list: ProductArea[]) => {
        return list.map(po => ({ id: po.id, label: po.name }))
    }

    const handleOpenModal = async () => {
        const res = await getAllProductAreas()
        console.log(res, "RES")
        if (res.content) {
            setProductAreas(mapToOptions(res.content))
            setShowModal(true)
        }

    }

    React.useEffect(() => {
        (async () => {
            const res = await getAllTeams()
            if (res.content)
                setTeamList(res.content as ProductTeam[])
        })()
    }, []);

    return (
        <React.Fragment>
            <Block display="flex" alignItems="baseline" justifyContent="space-between">
                <H4>Teams</H4>
                <Block>
                    <Button kind="outline" marginLeft onClick={() => handleOpenModal()}>
                        <FontAwesomeIcon icon={faPlusCircle} />&nbsp;Opprett nytt team
                    </Button>
                </Block>
            </Block>

            {teamList.length > 0 && (
                <ListView list={teamList} />
            )}

            {showModal && (
                <ModalTeam
                    title="Opprett nytt team"
                    isOpen={showModal}
                    initialValues={initialValues}
                    productAreaOptions={productAreas}
                    errorOnCreate={undefined}
                    submit={handleSubmit}
                    onClose={() => setShowModal(false)}
                />
            )}

        </React.Fragment>
    )
}

export default TeamListPage
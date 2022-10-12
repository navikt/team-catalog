import { css } from '@emotion/css'
import { EditFilled } from '@navikt/ds-icons'
import SvgBellFilled from '@navikt/ds-icons/esm/BellFilled'
import { BodyShort, Button, Heading } from '@navikt/ds-react'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { editProductArea, getProductArea, getAllTeamsForProductArea } from '../../api'
import { useClustersForProductArea } from '../../api/clusterApi'
import { getProcessesForProductArea } from '../../api/integrationApi'
import OwnerAreaSummary from '../../components/area/OwnerAreaSummary'
import ShortAreaSummarySection from '../../components/area/ShortAreaSummarySection'
import { AuditName } from '../../components/AuditName'
import Clusters from '../../components/common/cluster/Clusters'
import DescriptionSection from '../../components/common/DescriptionSection'
import Members from '../../components/common/Members'
import Teams from '../../components/common/team/Teams'
import { ProductAreaSummary, useDash } from '../../components/dash/Dashboard'
import Divider from '../../components/Divider'
import { ErrorMessageWithLink } from '../../components/ErrorMessageWithLink'
import { Markdown } from '../../components/Markdown'
import PageTitle from '../../components/PageTitle'
import StatusField from '../../components/StatusField'
import { ProductArea, ProductTeam, Process, ProductAreaFormValues, Status, ResourceType, AreaType } from '../../constants'
import { user } from '../../services/User'
import { intl } from '../../util/intl/intl'
import { PathParams } from '../team/TeamPage'

const ProductAreaPage = () => {
  const params = useParams<PathParams>()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState<boolean>(false)
  const [productArea, setProductArea] = React.useState<ProductArea>()
  const clusters = useClustersForProductArea(productArea?.id)
  const [teams, setTeams] = React.useState<ProductTeam[]>([])
  const [processes, setProcesses] = React.useState<Process[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [showDelete, setShowDelete] = useState(false)
  const [errorModal, setErrorModal] = React.useState()
  const dash = useDash()

  const paSummary: ProductAreaSummary | undefined = dash?.productAreas.find((pa) => pa.productAreaId === productArea?.id)

  const areaMembers = productArea?.members.length
  const paExternalMembers = productArea?.members.map((m) => {
    m.resource.resourceType == ResourceType.EXTERNAL
  }).length

  console.log({ dash })
  const handleSubmit = async (values: ProductAreaFormValues) => {
    try {
      const body = { ...values, id: productArea?.id }
      const res = await editProductArea(body)
      if (res.id) {
        setProductArea(res)
        setShowModal(false)
      }
    } catch (error: any) {
      setErrorModal(error.message)
    }
  }
  useEffect(() => {
    ;(async () => {
      if (params.id) {
        setLoading(true)
        try {
          const res = await getProductArea(params.id)
          setProductArea(res)
          if (res) {
            setTeams((await getAllTeamsForProductArea(params.id)).content.filter((team) => team.status === Status.ACTIVE))
          }
          getProcessesForProductArea(params.id).then(setProcesses)
        } catch (error: any) {
          console.log(error.message)
        }

        setLoading(false)
      }
    })()
  }, [params])

  return (
    <div>
      {!loading && !productArea && (
        <ErrorMessageWithLink errorMessage={intl.productAreaNotFound} href='/team' linkText={intl.linkToAllProductAreasText} />
      )}

      {productArea && (
        <>
          <PageTitle title={productArea.name} />

          <div
            className={css`
              display: flex;
              justify-content: space-between;
              align-items: center;
            `}>
            <div>
              <StatusField status={productArea.status} />
            </div>

            {productArea.changeStamp && (
              <div
                className={css`
                  margin-top: 2rem;
                  display: flex;
                  align-items: center;
                `}>
                <BodyShort
                  size='small'
                  className={css`
                    margin-right: 2rem;
                  `}>
                  <b>Sist endret av :</b> <AuditName name={productArea.changeStamp.lastModifiedBy} /> -{' '}
                  {moment(productArea.changeStamp?.lastModifiedDate).format('lll')}
                </BodyShort>

                {user.canWrite() && (
                  <Button
                    variant='secondary'
                    size='medium'
                    icon={<EditFilled aria-hidden />}
                    onClick={() => setShowModal(true)}
                    className={css`
                      margin-right: 1rem;
                    `}>
                    {intl.edit}
                  </Button>
                )}
                <Button variant='secondary' size='medium' icon={<SvgBellFilled aria-hidden />}>
                  Bli varslet
                </Button>
              </div>
            )}
          </div>

          <div
            className={css`
              display: grid;
              grid-template-columns: 0.4fr 0.4fr 0.4fr;
              grid-column-gap: 1rem;
              margin-top: 2rem;
            `}>
            <DescriptionSection header='Beskrivelse' text={<Markdown source={productArea.description} />} />
            <ShortAreaSummarySection productArea={productArea} />
            {productArea.areaType == AreaType.PRODUCT_AREA && <OwnerAreaSummary productArea={productArea} />}
          </div>
        </>
      )}
      <Divider />
      <div
        className={css`
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
        `}>
        <Heading
          size='medium'
          className={css`
            margin-right: 2rem;
            margin-top: 0px;
          `}>
          Team ({teams.length})
        </Heading>
        <Button
          variant='secondary'
          size='medium'
          className={css`
            margin-right: 1rem;
          `}>
          Eksporter team
        </Button>
      </div>
      <Teams teams={teams} />

      <Divider />
      <div
        className={css`
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
        `}>
        <Heading
          size='medium'
          className={css`
            margin-right: 2rem;
            margin-top: 0px;
          `}>
          Klynger ({clusters.length})
        </Heading>
      </div>
      <Clusters clusters={clusters} />
      <Divider />
      <div
        className={css`
          display: flex;
          justify-content: left;
          align-items: center;
          margin-bottom: 2rem;
        `}>
        <Heading
          size='medium'
          className={css`
            margin-right: 2rem;
            margin-top: 0px;
          `}>
          Medlemmer på områdenivå ({productArea?.members.length})
        </Heading>
        {paExternalMembers && areaMembers && (
          <BodyShort>
            <b>
              Eksterne{' '}
              {
                productArea?.members.map((m) => {
                  m.resource.resourceType == ResourceType.EXTERNAL
                }).length
              }{' '}
              ({(paExternalMembers / areaMembers) * 100} %)
            </b>
          </BodyShort>
        )}
      </div>
      {productArea?.members ? (
        <>
          <Members members={productArea.members} />
        </>
      ) : (
        <></>
      )}
    </div>
  )
}

export default ProductAreaPage

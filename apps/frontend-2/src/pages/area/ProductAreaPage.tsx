import 'dayjs/plugin/localizedFormat'

import { css } from '@emotion/css'
import { EditFilled } from '@navikt/ds-icons'
import SvgBellFilled from '@navikt/ds-icons/esm/BellFilled'
import { BodyShort, Button, Heading } from '@navikt/ds-react'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { editProductArea, getAllTeamsForProductArea,getProductArea } from '../../api'
import { useClustersForProductArea } from '../../api/clusterApi'
import { getProcessesForProductArea } from '../../api/integrationApi'
import OwnerAreaSummary from '../../components/area/OwnerAreaSummary'
import ShortAreaSummarySection from '../../components/area/ShortAreaSummarySection'
import { AuditName } from '../../components/AuditName'
import Clusters from '../../components/common/cluster/Clusters'
import DescriptionSection from '../../components/common/DescriptionSection'
import Members from '../../components/common/Members'
import Teams from '../../components/common/team/Teams'
import Divider from '../../components/Divider'
import { ErrorMessageWithLink } from '../../components/ErrorMessageWithLink'
import { Markdown } from '../../components/Markdown'
import PageTitle from '../../components/PageTitle'
import StatusField from '../../components/StatusField'
import type {Process, ProductArea, ProductAreaFormValues, ProductTeam} from '../../constants';
import { AreaType, ResourceType, Status } from '../../constants'
import { user } from '../../services/User'
import { intl } from '../../util/intl/intl'
import type { PathParameters as PathParameters } from '../team/TeamPage'

dayjs.locale('nb')

const ProductAreaPage = () => {
  const parameters = useParams<PathParameters>()
  const [loading, setLoading] = React.useState<boolean>(false)
  const [productArea, setProductArea] = React.useState<ProductArea>()
  const clusters = useClustersForProductArea(productArea?.id)
  const [teams, setTeams] = React.useState<ProductTeam[]>([])
  const [processes, setProcesses] = React.useState<Process[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [errorModal, setErrorModal] = React.useState()

  const getExternalLength = () => (productArea ? productArea?.members.filter((m) => m.resource.resourceType === ResourceType.EXTERNAL).length : 0)

  const areaMembers = productArea?.members.length

  // TODO 27 Oct 2022 (Johannes Moskvil) -- denne map operasjonen har vel ingen funksjon
  const paExternalMembers = productArea?.members.map((m) => {
    m.resource.resourceType == ResourceType.EXTERNAL
  }).length

  const handleSubmit = async (values: ProductAreaFormValues) => {
    try {
      const body = { ...values, id: productArea?.id }
      const editProductAreaResponse = await editProductArea(body)
      if (editProductAreaResponse.id) {
        setProductArea(editProductAreaResponse)
        setShowModal(false)
      }
    } catch (error: any) {
      setErrorModal(error.message)
    }
  }
  useEffect(() => {
    (async () => {
      if (parameters.id) {
        setLoading(true)
        try {
          const getProductAreaResponse = await getProductArea(parameters.id)
          setProductArea(getProductAreaResponse)
          if (getProductAreaResponse) {
            setTeams((await getAllTeamsForProductArea(parameters.id)).content.filter((team) => team.status === Status.ACTIVE))
          }
          getProcessesForProductArea(parameters.id).then(setProcesses)
        } catch (error: any) {
          console.log(error.message)
        }

        setLoading(false)
      }
    })()
  }, [parameters])

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
                  className={css`
                    margin-right: 2rem;
                  `}
                  size='small'>
                  <b>Sist endret av :</b> <AuditName name={productArea.changeStamp.lastModifiedBy} /> -{' '}
                  {dayjs(productArea.changeStamp?.lastModifiedDate).format('D. MMMM, YYYY H:mm ')}
                </BodyShort>

                {user.canWrite() && (
                  <Button
                    className={css`
                      margin-right: 1rem;
                    `}
                    icon={<EditFilled aria-hidden />}
                    onClick={() => setShowModal(true)}
                    size='medium'
                    variant='secondary'>
                    {intl.edit}
                  </Button>
                )}
                <Button icon={<SvgBellFilled aria-hidden />} size='medium' variant='secondary'>
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
          className={css`
            margin-right: 2rem;
            margin-top: 0px;
          `}
          size='medium'>
          Team ({teams.length})
        </Heading>
        <Button
          className={css`
            margin-right: 1rem;
          `}
          size='medium'
          variant='secondary'>
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
          className={css`
            margin-right: 2rem;
            margin-top: 0;
          `}
          size='medium'>
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
          className={css`
            margin-right: 2rem;
            margin-top: 0;
          `}
          size='medium'>
          Medlemmer på områdenivå ({productArea?.members.length})
        </Heading>
        {paExternalMembers && areaMembers && (
          <BodyShort>
            <b>
              Eksterne {getExternalLength()} ({getExternalLength() > 0 ? ((getExternalLength() / productArea.members.length) * 100).toFixed(0) : '0'}
              %)
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

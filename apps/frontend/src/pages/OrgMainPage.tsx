import { Block } from 'baseui/block'
import { useOrg } from '../api/OrgApi'
import { Redirect, useParams } from 'react-router-dom'
import PageTitle from '../components/common/PageTitle'
import { TextWithLabel } from '../components/common/TextWithLabel'
import { ParagraphMedium } from 'baseui/typography'
import RouteLink from '../components/common/RouteLink'
import { agressoIdDataToUrl } from '../util/orgurls'
import { UserImage } from '../components/common/UserImage'
import React from 'react'
import { OrgEnhetCard } from '../components/org/OrgEnhetCard'
import { text } from '@fortawesome/fontawesome-svg-core'

export interface OrgEnhet {
  agressoId: string
  orgNiv: string
  navn: string
  gyldigFom?: string
  gyldigTom?: string
  organiseringer: OrgEnhetOrganisering[]
  leder: Ressurs[]
  koblinger: Kobling[]
  type: Type
}

interface Type {
  kode: string
  navn: string
}

export interface Ressurs {
  ressurs: PersonInfo
}

interface PersonInfo {
  nomId?: any
  navIdent: any
  personIdent?: any
  koblinger?: Kobling[]
  lederFor?: any
  ledere?: any[]
  person?: any
  epost?: any
  visningsNavn?: any
  fornavn?: any
  etternavn?: any
}

interface Kobling {
  ressurs: PersonInfo
  gyldigFom?: string
  gyldigTom?: string
}

export interface OrgEnhetOrganisering {
  retning: 'over' | 'under'
  organisasjonsenhet: OrgEnhet
}

export interface HierarkiData {
  navn: string
  id: string
  orgNiv: string
}

const OrgHierarki = (props: { navn: string; id: string; cIndex: number }) => {
  return (
    <div>
      <RouteLink href={props.id} style={{ paddingLeft: String(props.cIndex * 27) + 'px' }}>
        {props.navn}
      </RouteLink>
    </div>
  )
}

const OrgEnhetInfo = (props: { enhetsnavn: string; agressoId: string; enhetsType: Type; orgNiv: string }) => {
  return (
    <div style={{ width: '50rem', marginBottom: '4em' }}>
      <Block width="50%">
        <ParagraphMedium>
          Enhetsnavn: <label>{props.enhetsnavn}</label>
        </ParagraphMedium>
        <ParagraphMedium>
          Agresso-ID: <label>{props.agressoId}</label>
        </ParagraphMedium>
        {props.enhetsType === null ? null : (
          <ParagraphMedium>
            Enhetstype: <label>{props.enhetsType.navn}</label>
          </ParagraphMedium>
        )}
      </Block>
    </div>
  )
}

const OrgLeder = (props: { navn: string; navIdent: string }) => {
  return (
    <div>
      <ParagraphMedium>
        {props.navn} (<RouteLink href={'/resource/'.concat(props.navIdent)}>{props.navIdent}</RouteLink>)
      </ParagraphMedium>
      <UserImage ident={props.navIdent} size={'150px'} />
    </div>
  )
}

const OrgRessurs = (props: { navn: string; navIdent: string }) => {
  return (
    <div>
      <ParagraphMedium>
        <RouteLink href={'/resource/'.concat(props.navIdent)}>
          {props.navn} ({props.navIdent})
        </RouteLink>
      </ParagraphMedium>
    </div>
  )
}

export const OrgMainPage = () => {
  const { id: orgId } = useParams<any>()
  const { org, orgHierarki } = useOrg(orgId)

  if (orgId === '0_NAV') {
    return <Redirect to={'/orgNAV'} />
  }
  if (!org) {
    return <div>Laster</div>
  }

  function sortItems(a: string, b: string) {
    if (a.localeCompare(b, 'no') < 0) {
      return -1
    } else if (a.localeCompare(b, 'no') > 0) {
      return 1
    }
    return 0
  }

  const oe: OrgEnhet = org as OrgEnhet
  const underenheter: { navn: string; id: string; orgNiv: string; leder: Ressurs[] }[] = oe.organiseringer
    .filter((oee) => oee.retning === 'under')
    .map((ue) => {
      return { navn: ue.organisasjonsenhet.navn, id: ue.organisasjonsenhet.agressoId, orgNiv: ue.organisasjonsenhet.orgNiv, leder: ue.organisasjonsenhet.leder }
    })
    .sort((a, b) => sortItems(a.navn, b.navn))

  const overenheter: { navn: string; id: string }[] = oe.organiseringer
    .filter((oee) => oee.retning === 'over')
    .map((ue) => {
      return { navn: ue.organisasjonsenhet.navn, id: ue.organisasjonsenhet.agressoId }
    })

  const orgLederInfo: { navn: string; navIdent: string }[] = oe.leder.map((lInfo) => {
    return { navn: lInfo.ressurs.visningsNavn, navIdent: lInfo.ressurs.navIdent }
  })

  const orgRessurs: { navn: string; navIdent: string }[] = oe.koblinger
    .map((or) => {
      return { navn: or.ressurs.visningsNavn ?? '<Ukjent navn>', navIdent: or.ressurs.navIdent }
    })
    .sort((a, b) => sortItems(a.navn, b.navn))
    .filter((v, i, a) => a.findIndex((t) => t.navIdent === v.navIdent) === i)

  const ueTitle = () => {
    if (overenheter.length === 0) {
      return ''
    } else {
      return 'Underenheter'
    }
  }

  return (
    <Block>
      {overenheter.length === 0 ? null : (
        <div style={{ backgroundColor: '#FEEDCE', border: 'solid', borderWidth: 'thin', borderColor: '#D27F20', borderRadius: '10px', padding: '0em 2em' }}>
          <ParagraphMedium>
            Organisasjonsstrukturen hentes rett fra lønnssystemet. Begrensninger i lønnssystemet gjør at ansatte må knyttes til laveste nivå i organisasjonsstrukturen. Dette fører
            eksempelvis til at “HR-avdelingen” gjentas flere ganger.
          </ParagraphMedium>
        </div>
      )}

      <PageTitle title={oe.navn} />
      {overenheter.length === 0 ? null : (
        <Block>
          <TextWithLabel
            label={'NAV-hierarki:'}
            text={orgHierarki.map((hierarkiData, index) => (
              <OrgHierarki key={hierarkiData.id} navn={hierarkiData.navn} id={agressoIdDataToUrl(hierarkiData.id, hierarkiData.orgNiv)} cIndex={index} />
            ))}
          />
        </Block>
      )}

      <Block>
        <Block display="flex" width="85%" marginTop="4em">
          <TextWithLabel width="50%" label={'Info'} text={<OrgEnhetInfo enhetsnavn={oe.navn} agressoId={oe.agressoId} enhetsType={oe.type} orgNiv={oe.orgNiv ?? 'null'} />} />

          <TextWithLabel
            $style={{ borderLeft: '1px solid #AFAFAF' }}
            paddingLeft="1em"
            width="40%"
            label={'Leder'}
            text={orgLederInfo.map((lederData) => (
              <OrgLeder key={lederData.navIdent} navn={lederData.navn} navIdent={lederData.navIdent} />
            ))}
          />
        </Block>
        {orgRessurs.length === 0 ? null : (
          <TextWithLabel
            label={'Ressurser'}
            text={
              <Block display={'grid'} gridTemplateColumns={'repeat(auto-fill, minmax(400px, 1fr))'}>
                {orgRessurs.map((rData) => (
                  <OrgRessurs key={rData.navIdent} navn={rData.navn} navIdent={rData.navIdent} />
                ))}
              </Block>
            }
          />
        )}
      </Block>

      {underenheter.length === 0 ? (
        <TextWithLabel marginTop="4em" label={ueTitle()} text={'Denne organisasjonsenheten har ingen underenheter'} />
      ) : (
        <TextWithLabel
          label={ueTitle()}
          text={
            <Block display="flex" flexWrap>
              {underenheter.map((ue) => (
                <OrgEnhetCard key={ue.id} navn={ue.navn} idUrl={agressoIdDataToUrl(ue.id, ue.orgNiv)} leder={ue.leder[0]} />
              ))}
            </Block>
          }
        />
      )}
    </Block>
  )
}

import { Block } from 'baseui/block'
import { Paragraph2 } from 'baseui/typography'
import { useParams } from 'react-router-dom'
import { useOrg } from '../api/OrgApi'
import PageTitle from '../components/common/PageTitle'
import RouteLink from '../components/common/RouteLink'
import { TextWithLabel } from '../components/common/TextWithLabel'
import { UserImage } from '../components/common/UserImage'
import { OrgEnhetCard } from '../components/org/OrgEnhetCard'
import { agressoIdDataToUrl } from '../util/orgurls'

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

interface Ressurs {
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

function sortItems(a: string, b: string) {
  if (a.localeCompare(b, 'no') < 0) {
    return -1
  } else if (a.localeCompare(b, 'no') > 0) {
    return 1
  }
  return 0
}

export const OrgStartPage = () => {
  const orgId = '0_NAV'
  const { org } = useOrg(orgId)

  if (!org) {
    return <div>Laster</div>
  }

  const oe: OrgEnhet = org as OrgEnhet

  const kunDirektoratet: { navn: string; id: string; orgNiv: string; leder: Ressurs[] }[] = oe.organiseringer
    .filter((oee) => oee.retning === 'under')
    .filter((oeee) => oeee.organisasjonsenhet.navn === 'Arbeids- og velferdsdirektoratet')
    .map((ue) => {
      return { navn: ue.organisasjonsenhet.navn, id: ue.organisasjonsenhet.agressoId, orgNiv: ue.organisasjonsenhet.orgNiv, leder: ue.organisasjonsenhet.leder }
    })

  const ikkeDirektoratet: { navn: string; id: string; orgNiv: string; leder: Ressurs[] }[] = oe.organiseringer
    .filter((oee) => oee.retning === 'under')
    .filter((oeee) => oeee.organisasjonsenhet.navn != 'Arbeids- og velferdsdirektoratet')
    .map((ue) => {
      return { navn: ue.organisasjonsenhet.navn, id: ue.organisasjonsenhet.agressoId, orgNiv: ue.organisasjonsenhet.orgNiv, leder: ue.organisasjonsenhet.leder }
    })
    .sort((a, b) => sortItems(a.navn, b.navn))

  return (
    <Block>
      <PageTitle title={oe.navn} />
      <Paragraph2 marginBottom="4em">
        Her presenteres organisasjonsinformasjon fra NOM, NAVs organisasjonsmaster som er under utvikling. Per nå importeres dataene hovedsakelig fra Unit4 (Agresso) og Remedy, via
        Datavarehus. Ser du feil eller mangler, eller har spørsmål? Ta kontakt på vår slack-kanal <a href="https://nav-it.slack.com/archives/CTN3BDUQ2">#NOM</a>
      </Paragraph2>
      <Block>
        <TextWithLabel
          label={'Direktoratet'}
          text={
            <Block display="flex" flexWrap marginBottom={'5em'}>
              {kunDirektoratet.map((ue) => (
                <OrgEnhetCard key={ue.id} navn={ue.navn} idUrl={agressoIdDataToUrl(ue.id, ue.orgNiv)} leder={ue.leder[0]} />
              ))}
            </Block>
          }
        />
        <TextWithLabel
          label={'Linjene'}
          text={
            <Block display="flex" flexWrap>
              {ikkeDirektoratet.map((ue) => (
                <OrgEnhetCard key={ue.id} navn={ue.navn} idUrl={agressoIdDataToUrl(ue.id, ue.orgNiv)} leder={ue.leder[0]} />
              ))}
            </Block>
          }
        />
      </Block>
    </Block>
  )
}

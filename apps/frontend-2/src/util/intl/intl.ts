import LocalizedStrings, { GlobalStrings, LocalizedStringsMethods } from 'react-localization'
import * as React from 'react'
import { useEffect } from 'react'
import { useForceUpdate } from '../hooks'
import { en, no } from './lang'
import 'dayjs/locale/nb'
import dayjs from 'dayjs'

export interface IStrings {
  PRODUCT: string
  PRODUCT_DESCRIPTION: string
  ADMINISTRATION: string
  ADMINISTRATION_DESCRIPTION: string
  IT: string
  IT_DESCRIPTION: string
  PROJECT: string
  PROJECT_DESCRIPTION: string
  OTHER: string
  OTHER_DESCRIPTION: string
  UNKNOWN: string
  UNKNOWN_DESCRIPTION: string
  edit: string
  dataIsMissing: string

  PRODUCT_AREA_AREATYPE_DESCRIPTION: string
  PROJECT_AREATYPE_DESCRIPTION: string
  IT_AREATYPE_DESCRIPTION: string
  OTHER_AREATYPE_DESCRIPTION: string

  CREATE: string
  UPDATE: string
  DELETE: string

  INTERNAL: string
  EXTERNAL: string

  nonNavEmployee: string

  AREA: string
  TEAM: string
  Team: string
  ProductArea: string
  Cluster: string

  LEAD: string
  DEVELOPER: string
  TESTER: string
  TECH_DOMAIN_SPECIALIST: string
  TECH_LEAD: string
  TEST_LEAD: string
  PRODUCT_OWNER: string
  PRODUCT_LEAD: string
  SECURITY_ARCHITECT: string
  SOLUTION_ARCHITECT: string
  BUSINESS_ANALYST: string
  DOMAIN_EXPERT: string
  DOMAIN_RESPONSIBLE: string
  DOMAIN_RESOURCE: string
  ARCHITECT: string
  AGILE_COACH: string
  DATA_MANAGER: string
  DATA_SCIENTIST: string
  MAINTENANCE_MANAGER: string
  DESIGNER: string
  OPERATIONS: string
  FUNCTIONAL_ADVISER: string
  TECHNICAL_ADVISER: string
  TECHNICAL_TESTER: string
  COMMUNICATION_ADVISER: string
  AREA_LEAD: string
  LEGAL_ADVISER: string
  SECURITY_CHAMPION: string
  UU_CHAMPION: string
  PROFIT_COACH: string
  CONTROLLER: string
  STAFFING_MANAGER: string
  DESIGN_RESEARCHER: string
  HEAD_OF_LEGAL: string

  STREAM_ALIGNED: string
  ENABLING: string
  PLATFORM: string
  COMPLICATED_SUBSYSTEM: string
  WORKGROUP: string
  MANAGEMENT: string
  PROJECTGROUP: string

  STREAM_ALIGNED_DESCRIPTION: string
  ENABLING_DESCRIPTION: string
  PLATFORM_DESCRIPTION: string
  COMPLICATED_SUBSYSTEM_DESCRIPTION: string
  WORKGROUP_DESCRIPTION: string
  MANAGEMENT_DESCRIPTION: string
  PROJECTGROUP_DESCRIPTION: string

  administrate: string
  emptyTable: string
  audits: string
  audit: string
  mailLog: string
  searchId: string
  id: string
  user: string
  time: string
  rows: string
  action: string
  lastChanges: string
  table: string
  auditNotFound: string
  view: string
  auditNr: string
  close: string
  version: string
  nextButton: string
  prevButton: string
  settings: string
  abort: string
  save: string
  pageNotFound: string
  teamNotFound: string
  productAreaNotFound: string
  clusterNotFound: string
  linkToAllTeamsText: string
  linkToAllProductAreasText: string
  ACTIVE: string
  PLANNED: string
  INACTIVE: string
}

// Remember import moment locales up top
export const langs: Langs = {
  nb: { flag: 'no', name: 'Norsk', langCode: 'nb', texts: no },
  en: { flag: 'gb', name: 'English', langCode: 'en', texts: en },
}

export const langsArray: Lang[] = Object.keys(langs).map((lang) => langs[lang])

// Controls starting language as well as fallback language if a text is missing in chosen language
const defaultLang = langs.nb

type IIntl = LocalizedStringsMethods & IStrings

interface LocalizedStringsFactory {
  new <T>(props: GlobalStrings<T>, options?: { customLanguageInterface: () => string }): IIntl
}

const strings: IntlLangs = {}

Object.keys(langs).forEach((lang) => (strings[lang] = langs[lang].texts))

export const intl: IIntl = new (LocalizedStrings as LocalizedStringsFactory)(strings as any, { customLanguageInterface: () => defaultLang.langCode })

interface IntlLangs {
  [lang: string]: IStrings
}

export interface Lang {
  flag: string
  name: string
  langCode: string
  texts: any
}

interface Langs {
  [lang: string]: Lang
}

// hooks

const localStorageAvailable = storageAvailable()

export const useLang = () => {
  const [lang, setLang] = React.useState<string>(((localStorageAvailable && localStorage.getItem('tcat-lang')) as string) || defaultLang.langCode)
  const update = useForceUpdate()
  useEffect(() => {
    intl.setLanguage(lang)
    let dayjslocale = dayjs.locale(lang)
    if (lang !== dayjslocale) console.warn('dayjs locale missing', lang)
    localStorageAvailable && localStorage.setItem('tcat-lang', lang)
    update()
  }, [lang])

  return setLang
}

function storageAvailable() {
  try {
    let key = 'ptab'
    localStorage.setItem(key, key)
    localStorage.removeItem(key)
    return true
  } catch (e: any) {
    return false
  }
}

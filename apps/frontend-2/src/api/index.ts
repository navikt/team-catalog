import axios from 'axios'

export * from './productAreaApi'
export * from './resourceApi'
export * from './tagApi'
export * from './teamApi'
export * from './userApi'

export const mapToOptions = (list: {id: string, name: string}[]) => {
  return list.map(po => ({id: po.id, label: po.name}))
}

// Add auth cookie to rest calls
axios.defaults.withCredentials = true

import axios from 'axios'

export * from './productAreaApi'
export * from './userApi'
export * from './tagApi'
export * from './teamApi'
export * from './resourceApi'

export const mapToOptions = (list: {id: string, name: string}[]) => {
  return list.map(po => ({value: po.id, label: po.name}))
}

// Add auth cookie to rest calls
axios.defaults.withCredentials = true

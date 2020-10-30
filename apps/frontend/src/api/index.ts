export * from './productAreaApi'
export * from './userApi'
export * from './tagApi'
export * from './teamApi'
export * from './resourceApi'

export const mapToOptions = (list: {id: string, name: string}[]) => {
  return list.map(po => ({id: po.id, label: po.name}))
}

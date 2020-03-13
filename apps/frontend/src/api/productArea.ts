import axios from 'axios'
import { PageResponse } from '../constants'
import { env } from '../util/env'

export const getAllTeams = async () => {
    const data = (await axios.get<PageResponse<any>>(`${env.pollyBaseUrl}/productarea`)).data
    console.log(data, "Data")
    return data
}
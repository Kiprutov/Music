import axios from 'axios'

const baseURL = process.env.API_URL || 'http://localhost:8081/'

export default () => {
  return axios.create({
    baseURL
  })
}

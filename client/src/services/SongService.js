import Api from '@/services/Api'

export default {
  getSongs (params = {}) {
    return Api().get('songs', { params })
  },
  createSong (song) {
    return Api().post('songs', song)
  },
  deleteSong (id) {
    return Api().delete(`songs/${id}`)
  }
}

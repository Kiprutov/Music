const {Song} = require('../models')

module.exports = {
    // GET /songs — list all songs
    async index (req, res) {
        try {
            const songs = await Song.findAll()
            res.send(songs)
        } catch (err) {
            res.status(500).send({
                error: 'An error occurred while fetching songs.'
            })
        }
    },

    // POST /songs — add a new song
    async create (req, res) {
        try {
            const song = await Song.create(req.body)
            res.send(song)
        } catch (err) {
            res.status(400).send({
                error: 'Could not create song. Check that title, artist and url are provided.'
            })
        }
    },

    // GET /songs/:id — get a single song
    async show (req, res) {
        try {
            const song = await Song.findByPk(req.params.id)
            if (!song) {
                return res.status(404).send({ error: 'Song not found.' })
            }
            res.send(song)
        } catch (err) {
            res.status(500).send({ error: 'An error occurred.' })
        }
    },

    // DELETE /songs/:id — delete a song
    async destroy (req, res) {
        try {
            const song = await Song.findByPk(req.params.id)
            if (!song) {
                return res.status(404).send({ error: 'Song not found.' })
            }
            await song.destroy()
            res.send({ message: 'Song deleted successfully.' })
        } catch (err) {
            res.status(500).send({ error: 'An error occurred.' })
        }
    }
}

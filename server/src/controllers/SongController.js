const {Song, Sequelize} = require('../models')
const Op = Sequelize.Op

module.exports = {
    // GET /songs — list all songs (optional query: search, sort, page, limit)
    async index (req, res) {
        try {
            const { search, sort, page, limit } = req.query
            const where = {}

            if (search) {
                const term = `%${search}%`
                where[Op.or] = [
                    { title: { [Op.like]: term } },
                    { artist: { [Op.like]: term } },
                    { album: { [Op.like]: term } }
                ]
            }

            const sortMap = {
                title_asc: [['title', 'ASC']],
                title_desc: [['title', 'DESC']],
                artist_asc: [['artist', 'ASC']],
                artist_desc: [['artist', 'DESC']],
                newest: [['createdAt', 'DESC']],
                oldest: [['createdAt', 'ASC']]
            }
            const order = sortMap[sort] || [['createdAt', 'DESC']]

            const query = { where, order }

            const pageNum = parseInt(page, 10)
            const limitNum = parseInt(limit, 10)
            if (!isNaN(pageNum) && !isNaN(limitNum) && limitNum > 0) {
                query.limit = limitNum
                query.offset = (Math.max(pageNum, 1) - 1) * limitNum
            }

            const songs = await Song.findAll(query)
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

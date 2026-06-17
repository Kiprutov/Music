const AuthenticationController = require('./controllers/AuthenticationController')
const AuthenticationControllerPolicy = require('./policies/AuthenticationControllerPolicy')
const SongController = require('./controllers/SongController')

module.exports = (app) => {
    // Auth routes
    app.post('/register',
      AuthenticationControllerPolicy.register,
      AuthenticationController.register)

    app.post('/login',
      AuthenticationController.login)

    // Song routes
    app.get('/songs', SongController.index)
    app.post('/songs', SongController.create)
    app.get('/songs/:id', SongController.show)
    app.delete('/songs/:id', SongController.destroy)
}

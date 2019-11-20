module.exports = {
    port: process.env.PORT || 8081,
    db: {
        database: process.env.DB_NAME || 'Music',
        user: process.env.DB_USER || 'Music',
        password: process.env.DB_PASS || 'Music',
        options: {
            dialect: process.env.DIALECT || 'sqlite',
            host: process.env.HOST || 'localhost',
            storage: './Music.sqlite'
        } 
    },
    authentication: {
        jwtSecret: process.env.JWT_SECRET || 'secret'
    }
}

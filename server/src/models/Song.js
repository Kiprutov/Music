module.exports = (sequelize, DataTypes) => {
    const Song = sequelize.define('Song', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        artist: {
            type: DataTypes.STRING,
            allowNull: false
        },
        album: {
            type: DataTypes.STRING,
            defaultValue: 'Unknown Album'
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'URL or path to the audio file'
        },
        duration: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Duration in seconds'
        },
        coverUrl: {
            type: DataTypes.STRING,
            defaultValue: null,
            comment: 'URL to album art image'
        }
    })

    return Song
}

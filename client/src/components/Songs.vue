<template>
  <v-container>
    <!-- Add Song Form (logged in users only) -->
    <v-layout row wrap v-if="$store.state.isUserLoggedIn">
      <v-flex xs12 md8 offset-md2 mb-4>
        <panel title="Add a Song">
          <v-layout row wrap>
            <v-flex xs12 sm6 pa-1>
              <v-text-field
                label="Title *"
                v-model="newSong.title"
              ></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 pa-1>
              <v-text-field
                label="Artist *"
                v-model="newSong.artist"
              ></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 pa-1>
              <v-text-field
                label="Album"
                v-model="newSong.album"
              ></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 pa-1>
              <v-text-field
                label="Audio URL *"
                v-model="newSong.url"
                placeholder="https://example.com/song.mp3"
              ></v-text-field>
            </v-flex>
            <v-flex xs12 pa-1>
              <v-text-field
                label="Cover Image URL"
                v-model="newSong.coverUrl"
                placeholder="https://example.com/cover.jpg"
              ></v-text-field>
            </v-flex>
            <v-flex xs12 pa-1>
              <div class="error mb-2" v-if="addError">{{ addError }}</div>
              <v-btn class="cyan" dark @click="addSong" :loading="adding">
                Add Song
              </v-btn>
            </v-flex>
          </v-layout>
        </panel>
      </v-flex>
    </v-layout>

    <!-- Now Playing Bar -->
    <v-layout row wrap v-if="currentSong">
      <v-flex xs12 md8 offset-md2 mb-4>
        <div class="now-playing elevation-4">
          <div class="now-playing-info">
            <img
              v-if="currentSong.coverUrl"
              :src="currentSong.coverUrl"
              class="now-playing-cover"
              @error="currentSong.coverUrl = null"
            />
            <div class="now-playing-cover default-cover" v-else>
              <v-icon large color="white">music_note</v-icon>
            </div>
            <div class="now-playing-text">
              <div class="now-playing-title">{{ currentSong.title }}</div>
              <div class="now-playing-artist">{{ currentSong.artist }}</div>
            </div>
          </div>

          <!-- Controls -->
          <div class="player-controls">
            <v-btn icon @click="playPrev" :disabled="songs.length < 2">
              <v-icon>skip_previous</v-icon>
            </v-btn>
            <v-btn icon large class="cyan" dark @click="togglePlay">
              <v-icon large>{{ isPlaying ? 'pause' : 'play_arrow' }}</v-icon>
            </v-btn>
            <v-btn icon @click="playNext" :disabled="songs.length < 2">
              <v-icon>skip_next</v-icon>
            </v-btn>
          </div>

          <!-- Progress -->
          <div class="player-progress px-3">
            <span class="time-label">{{ formatTime(currentTime) }}</span>
            <v-slider
              :value="progress"
              @input="seek"
              min="0"
              max="100"
              hide-details
              class="mx-2"
              color="cyan"
            ></v-slider>
            <span class="time-label">{{ formatTime(duration) }}</span>
          </div>

          <!-- Volume -->
          <div class="player-volume px-3 pb-2">
            <v-icon small>volume_down</v-icon>
            <v-slider
              v-model="volume"
              @input="setVolume"
              min="0"
              max="100"
              hide-details
              class="mx-2"
              color="cyan"
              style="max-width: 120px"
            ></v-slider>
            <v-icon small>volume_up</v-icon>
          </div>
        </div>

        <!-- Hidden audio element -->
        <audio
          ref="audioPlayer"
          :src="currentSong.url"
          @timeupdate="onTimeUpdate"
          @ended="playNext"
          @loadedmetadata="onMetaLoaded"
        ></audio>
      </v-flex>
    </v-layout>

    <!-- Songs List -->
    <v-layout row wrap>
      <v-flex xs12 md8 offset-md2>
        <panel title="Songs">
          <div v-if="loading" class="text-xs-center py-4">
            <v-progress-circular indeterminate color="cyan"></v-progress-circular>
          </div>

          <div v-else-if="songs.length === 0" class="text-xs-center py-4 grey--text">
            <v-icon large color="grey lighten-1">music_off</v-icon>
            <p class="mt-2">No songs yet. Add one above!</p>
          </div>

          <v-list v-else two-line>
            <template v-for="(song, index) in songs">
              <v-list-tile
                :key="song.id"
                :class="{ 'active-song': currentSong && currentSong.id === song.id }"
                @click="playSong(index)"
                avatar
              >
                <!-- Cover or default icon -->
                <v-list-tile-avatar>
                  <img v-if="song.coverUrl" :src="song.coverUrl" @error="song.coverUrl = null" />
                  <v-icon v-else class="cyan white--text" style="border-radius:50%; padding:8px">
                    {{ currentSong && currentSong.id === song.id && isPlaying ? 'pause' : 'music_note' }}
                  </v-icon>
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-title :class="currentSong && currentSong.id === song.id ? 'cyan--text' : ''">
                    {{ song.title }}
                  </v-list-tile-title>
                  <v-list-tile-sub-title>{{ song.artist }} — {{ song.album || 'Unknown Album' }}</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action v-if="$store.state.isUserLoggedIn">
                  <v-btn icon @click.stop="deleteSong(song.id)">
                    <v-icon color="grey lighten-1">delete</v-icon>
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
              <v-divider :key="'d' + index" v-if="index < songs.length - 1"></v-divider>
            </template>
          </v-list>
        </panel>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Panel from '@/components/Panel'
import SongService from '@/services/SongService'

export default {
  components: { Panel },
  data () {
    return {
      songs: [],
      loading: true,
      adding: false,
      addError: null,
      currentSong: null,
      currentIndex: -1,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 80,
      newSong: {
        title: '',
        artist: '',
        album: '',
        url: '',
        coverUrl: ''
      }
    }
  },
  computed: {
    progress () {
      if (!this.duration) return 0
      return (this.currentTime / this.duration) * 100
    }
  },
  async mounted () {
    await this.loadSongs()
  },
  methods: {
    async loadSongs () {
      try {
        const response = await SongService.getSongs()
        this.songs = response.data
      } catch (err) {
        console.error('Failed to load songs', err)
      } finally {
        this.loading = false
      }
    },

    async addSong () {
      this.addError = null
      if (!this.newSong.title || !this.newSong.artist || !this.newSong.url) {
        this.addError = 'Title, artist and audio URL are required.'
        return
      }
      this.adding = true
      try {
        const response = await SongService.createSong(this.newSong)
        this.songs.push(response.data)
        this.newSong = { title: '', artist: '', album: '', url: '', coverUrl: '' }
      } catch (err) {
        this.addError = 'Failed to add song. Please try again.'
      } finally {
        this.adding = false
      }
    },

    async deleteSong (id) {
      try {
        await SongService.deleteSong(id)
        const idx = this.songs.findIndex(s => s.id === id)
        if (idx !== -1) this.songs.splice(idx, 1)
        if (this.currentSong && this.currentSong.id === id) {
          this.currentSong = null
          this.isPlaying = false
        }
      } catch (err) {
        console.error('Failed to delete song', err)
      }
    },

    playSong (index) {
      this.currentIndex = index
      this.currentSong = this.songs[index]
      this.$nextTick(() => {
        const player = this.$refs.audioPlayer
        if (player) {
          player.volume = this.volume / 100
          player.play()
          this.isPlaying = true
        }
      })
    },

    togglePlay () {
      const player = this.$refs.audioPlayer
      if (!player) return
      if (this.isPlaying) {
        player.pause()
        this.isPlaying = false
      } else {
        player.play()
        this.isPlaying = true
      }
    },

    playNext () {
      if (this.songs.length === 0) return
      const next = (this.currentIndex + 1) % this.songs.length
      this.playSong(next)
    },

    playPrev () {
      if (this.songs.length === 0) return
      const prev = (this.currentIndex - 1 + this.songs.length) % this.songs.length
      this.playSong(prev)
    },

    onTimeUpdate () {
      const player = this.$refs.audioPlayer
      if (player) this.currentTime = player.currentTime
    },

    onMetaLoaded () {
      const player = this.$refs.audioPlayer
      if (player) this.duration = player.duration
    },

    seek (value) {
      const player = this.$refs.audioPlayer
      if (player && this.duration) {
        player.currentTime = (value / 100) * this.duration
      }
    },

    setVolume (value) {
      const player = this.$refs.audioPlayer
      if (player) player.volume = value / 100
    },

    formatTime (seconds) {
      if (!seconds || isNaN(seconds)) return '0:00'
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return `${m}:${s.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.error {
  color: red;
}

.now-playing {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 16px;
  color: white;
}

.now-playing-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.now-playing-cover {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 12px;
}

.default-cover {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: #00bcd4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.now-playing-title {
  font-size: 16px;
  font-weight: 600;
}

.now-playing-artist {
  font-size: 13px;
  color: #aaa;
}

.player-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}

.player-progress,
.player-volume {
  display: flex;
  align-items: center;
}

.time-label {
  font-size: 12px;
  color: #aaa;
  min-width: 36px;
}

.active-song {
  background: #e0f7fa;
}
</style>

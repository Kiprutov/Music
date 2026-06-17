<template>
  <div class="songs-page" :class="{ 'has-player': currentSong }">
    <div class="songs-layout">

      <!-- Page intro -->
      <header class="page-intro">
        <div class="intro-left">
          <span class="eyebrow">Library</span>
          <h1 class="page-title">Songs</h1>
          <p class="page-lead">Browse, play, and manage your music collection.</p>
        </div>
        <div class="intro-actions" v-if="isLoggedIn">
          <v-btn
            depressed
            color="primary"
            class="upload-btn"
            @click="showAddForm = !showAddForm"
          >
            <v-icon left small>{{ showAddForm ? 'close' : 'add' }}</v-icon>
            {{ showAddForm ? 'Cancel' : 'Upload track' }}
          </v-btn>
        </div>
      </header>

      <!-- Stats -->
      <div class="stats-row" v-if="!loading && !loadError">
        <div class="stat-card">
          <span class="stat-value">{{ songs.length }}</span>
          <span class="stat-label">Total tracks</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ sortedSongs.length }}</span>
          <span class="stat-label">Matching filters</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ currentSong ? '1' : '0' }}</span>
          <span class="stat-label">Now playing</span>
        </div>
      </div>

      <!-- Upload panel -->
      <v-expand-transition>
        <section v-if="isLoggedIn && showAddForm" class="upload-panel">
          <div class="panel-head">
            <h2>Upload a new track</h2>
            <p>Add song metadata and a public audio URL.</p>
          </div>
          <div class="form-grid">
            <v-text-field
              v-model="newSong.title"
              label="Title"
              solo
              flat
              hide-details
              class="form-field"
            ></v-text-field>
            <v-text-field
              v-model="newSong.artist"
              label="Artist"
              solo
              flat
              hide-details
              class="form-field"
            ></v-text-field>
            <v-text-field
              v-model="newSong.album"
              label="Album"
              solo
              flat
              hide-details
              class="form-field"
            ></v-text-field>
            <v-text-field
              v-model="newSong.url"
              label="Audio URL"
              placeholder="https://example.com/song.mp3"
              solo
              flat
              hide-details
              class="form-field"
            ></v-text-field>
            <v-text-field
              v-model="newSong.coverUrl"
              label="Cover image URL (optional)"
              placeholder="https://example.com/cover.jpg"
              solo
              flat
              hide-details
              class="form-field form-field-wide"
            ></v-text-field>
          </div>
          <div class="form-footer">
            <span class="form-error" v-if="addError">{{ addError }}</span>
            <v-btn depressed color="primary" :loading="adding" @click="addSong">
              Save track
            </v-btn>
          </div>
        </section>
      </v-expand-transition>

      <!-- Toolbar -->
      <section class="toolbar">
        <div class="search-wrap">
          <v-icon class="search-icon" small>search</v-icon>
          <input
            v-model="query"
            type="search"
            class="search-input"
            placeholder="Search by title, artist, or album"
            aria-label="Search songs"
          />
          <button
            v-if="query"
            class="search-clear"
            type="button"
            @click="query = ''"
            aria-label="Clear search"
          >
            <v-icon small>close</v-icon>
          </button>
        </div>

        <div class="toolbar-right">
          <div class="filter-chips">
            <button
              v-for="opt in filterOptions"
              :key="opt.value"
              type="button"
              class="chip"
              :class="{ 'chip-active': filterBy === opt.value }"
              @click="filterBy = opt.value"
            >
              {{ opt.text }}
            </button>
          </div>

          <v-menu offset-y left>
            <v-btn flat small slot="activator" class="sort-btn">
              <v-icon left small>sort</v-icon>
              {{ currentSortLabel }}
              <v-icon right small>expand_more</v-icon>
            </v-btn>
            <v-list dense>
              <v-list-tile
                v-for="opt in sortOptions"
                :key="opt.value"
                @click="sortBy = opt.value"
              >
                <v-list-tile-title :class="{ 'sort-active': sortBy === opt.value }">
                  {{ opt.text }}
                </v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </div>
      </section>

      <!-- Results bar -->
      <div class="results-bar" v-if="!loading && !loadError && songs.length > 0">
        <span>{{ resultsLabel }}</span>
        <button
          v-if="query || filterBy !== 'all'"
          type="button"
          class="text-btn"
          @click="resetFilters"
        >
          Reset filters
        </button>
      </div>

      <!-- Library -->
      <section class="library-card">

        <!-- Loading -->
        <div v-if="loading" class="state-view">
          <div class="skeleton-table">
            <div class="skeleton-row" v-for="n in 6" :key="n">
              <div class="sk-cover"></div>
              <div class="sk-lines">
                <div class="sk-line sk-line-md"></div>
                <div class="sk-line sk-line-sm"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="loadError" class="state-view state-centered">
          <div class="state-icon state-icon-error">
            <v-icon>error_outline</v-icon>
          </div>
          <h3>Unable to load library</h3>
          <p>{{ loadError }}</p>
          <v-btn depressed color="primary" @click="loadSongs">Try again</v-btn>
        </div>

        <!-- Empty library -->
        <div v-else-if="songs.length === 0" class="state-view state-centered">
          <div class="state-icon">
            <v-icon>library_music</v-icon>
          </div>
          <h3>Your library is empty</h3>
          <p v-if="isLoggedIn">Upload your first track to start building your catalog.</p>
          <p v-else>Sign in to upload music, or check back when tracks are available.</p>
          <v-btn
            v-if="isLoggedIn"
            depressed
            color="primary"
            @click="showAddForm = true"
          >
            Upload track
          </v-btn>
          <v-btn
            v-else
            flat
            color="primary"
            @click="$router.push({ name: 'login' })"
          >
            Sign in
          </v-btn>
        </div>

        <!-- No filter matches -->
        <div v-else-if="sortedSongs.length === 0" class="state-view state-centered">
          <div class="state-icon">
            <v-icon>search_off</v-icon>
          </div>
          <h3>No results found</h3>
          <p>Adjust your search or filters and try again.</p>
          <v-btn flat color="primary" @click="resetFilters">Reset filters</v-btn>
        </div>

        <!-- Song table -->
        <div v-else>
          <div class="table-head hidden-xs-only">
            <span class="col-num">#</span>
            <span class="col-track">Track</span>
            <span class="col-artist">Artist</span>
            <span class="col-album">Album</span>
            <span class="col-actions"></span>
          </div>

          <div class="table-body">
            <div
              v-for="(song, index) in visibleSongs"
              :key="song.id"
              class="track-row"
              :class="{ 'track-row-active': currentSong && currentSong.id === song.id }"
              @click="playSongById(song.id)"
            >
              <span class="col-num track-num">
                <span v-if="!(currentSong && currentSong.id === song.id && isPlaying)">{{ index + 1 }}</span>
                <v-icon v-else small color="primary" class="playing-icon">equalizer</v-icon>
              </span>

              <div class="col-track track-main">
                <div class="track-cover">
                  <img
                    v-if="song.coverUrl"
                    :src="song.coverUrl"
                    :alt="song.title"
                    @error="song.coverUrl = null"
                  />
                  <div v-else class="track-cover-fallback">
                    <v-icon small color="primary">music_note</v-icon>
                  </div>
                </div>
                <div class="track-text">
                  <span class="track-name">{{ song.title }}</span>
                  <span class="track-artist-mobile hidden-sm-and-up">{{ song.artist }}</span>
                </div>
              </div>

              <span class="col-artist track-artist hidden-xs-only">{{ song.artist }}</span>
              <span class="col-album track-album hidden-xs-only">{{ song.album || 'Single' }}</span>

              <div class="col-actions track-actions" @click.stop>
                <button
                  type="button"
                  class="icon-btn play-btn"
                  :aria-label="currentSong && currentSong.id === song.id && isPlaying ? 'Pause' : 'Play'"
                  @click="playSongById(song.id)"
                >
                  <v-icon small>
                    {{ currentSong && currentSong.id === song.id && isPlaying ? 'pause' : 'play_arrow' }}
                  </v-icon>
                </button>
                <button
                  v-if="isLoggedIn"
                  type="button"
                  class="icon-btn delete-btn"
                  aria-label="Delete song"
                  @click="deleteSong(song.id)"
                >
                  <v-icon small>delete_outline</v-icon>
                </button>
              </div>
            </div>
          </div>

          <div class="table-footer" v-if="hasMore">
            <v-btn depressed class="load-more-btn" :loading="loadingMore" @click="loadMore">
              Show more tracks
            </v-btn>
          </div>
        </div>
      </section>
    </div>

    <!-- Sticky player -->
    <transition name="player-slide">
      <footer v-if="currentSong" class="player-bar">
        <div class="player-bar-inner">
          <div class="player-track">
            <div class="player-cover">
              <img
                v-if="currentSong.coverUrl"
                :src="currentSong.coverUrl"
                :alt="currentSong.title"
              />
              <div v-else class="player-cover-fallback">
                <v-icon small color="primary">library_music</v-icon>
              </div>
            </div>
            <div class="player-meta">
              <div class="player-title">{{ currentSong.title }}</div>
              <div class="player-artist">{{ currentSong.artist }}</div>
            </div>
          </div>

          <div class="player-center">
            <div class="player-buttons">
              <button type="button" class="icon-btn" :disabled="sortedSongs.length < 2" @click="playPrev">
                <v-icon small>skip_previous</v-icon>
              </button>
              <button type="button" class="icon-btn play-main" @click="togglePlay">
                <v-icon>{{ isPlaying ? 'pause' : 'play_arrow' }}</v-icon>
              </button>
              <button type="button" class="icon-btn" :disabled="sortedSongs.length < 2" @click="playNext">
                <v-icon small>skip_next</v-icon>
              </button>
            </div>
            <div class="player-scrub">
              <span class="time">{{ formatTime(currentTime) }}</span>
              <v-slider
                :value="progress"
                @input="seek"
                min="0"
                max="100"
                hide-details
                color="primary"
                class="scrub-slider"
              ></v-slider>
              <span class="time">{{ formatTime(duration) }}</span>
            </div>
          </div>

          <div class="player-volume hidden-xs-only">
            <v-icon small>volume_up</v-icon>
            <v-slider
              v-model="volume"
              @input="setVolume"
              min="0"
              max="100"
              hide-details
              color="primary"
              class="volume-slider"
            ></v-slider>
          </div>
        </div>

        <audio
          ref="audioPlayer"
          :src="currentSong.url"
          @timeupdate="onTimeUpdate"
          @ended="playNext"
          @loadedmetadata="onMetaLoaded"
        ></audio>
      </footer>
    </transition>
  </div>
</template>

<script>
import SongService from '@/services/SongService'

export default {
  name: 'Songs',
  data () {
    return {
      songs: [],
      loading: true,
      loadingMore: false,
      loadError: null,
      adding: false,
      addError: null,
      showAddForm: false,
      query: '',
      filterBy: 'all',
      sortBy: 'newest',
      displayLimit: 15,
      pageSize: 15,
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
      },
      filterOptions: [
        { text: 'All', value: 'all' },
        { text: 'With artwork', value: 'with_cover' },
        { text: 'No artwork', value: 'no_cover' }
      ],
      sortOptions: [
        { text: 'Newest first', value: 'newest' },
        { text: 'Oldest first', value: 'oldest' },
        { text: 'Title A–Z', value: 'title_asc' },
        { text: 'Title Z–A', value: 'title_desc' },
        { text: 'Artist A–Z', value: 'artist_asc' },
        { text: 'Artist Z–A', value: 'artist_desc' }
      ]
    }
  },
  computed: {
    isLoggedIn () {
      return this.$store.state.isUserLoggedIn
    },
    progress () {
      if (!this.duration) return 0
      return (this.currentTime / this.duration) * 100
    },
    currentSortLabel () {
      const match = this.sortOptions.find(o => o.value === this.sortBy)
      return match ? match.text : 'Sort'
    },
    filteredSongs () {
      let list = this.songs.slice()

      if (this.query) {
        const q = this.query.toLowerCase().trim()
        list = list.filter(song => {
          const title = (song.title || '').toLowerCase()
          const artist = (song.artist || '').toLowerCase()
          const album = (song.album || '').toLowerCase()
          return title.includes(q) || artist.includes(q) || album.includes(q)
        })
      }

      if (this.filterBy === 'with_cover') {
        list = list.filter(song => !!song.coverUrl)
      } else if (this.filterBy === 'no_cover') {
        list = list.filter(song => !song.coverUrl)
      }

      return list
    },
    sortedSongs () {
      const list = this.filteredSongs.slice()

      list.sort((a, b) => {
        const titleA = (a.title || '').toLowerCase()
        const titleB = (b.title || '').toLowerCase()
        const artistA = (a.artist || '').toLowerCase()
        const artistB = (b.artist || '').toLowerCase()
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()

        switch (this.sortBy) {
          case 'title_asc': return titleA.localeCompare(titleB)
          case 'title_desc': return titleB.localeCompare(titleA)
          case 'artist_asc': return artistA.localeCompare(artistB)
          case 'artist_desc': return artistB.localeCompare(artistA)
          case 'oldest': return dateA - dateB
          case 'newest':
          default: return dateB - dateA
        }
      })

      return list
    },
    visibleSongs () {
      return this.sortedSongs.slice(0, this.displayLimit)
    },
    hasMore () {
      return this.displayLimit < this.sortedSongs.length
    },
    resultsLabel () {
      const total = this.songs.length
      const shown = this.visibleSongs.length
      const matched = this.sortedSongs.length
      if (matched === total) {
        return `${shown} of ${total} tracks`
      }
      return `${shown} of ${matched} results`
    }
  },
  watch: {
    query () { this.resetDisplayLimit() },
    filterBy () { this.resetDisplayLimit() },
    sortBy () { this.resetDisplayLimit() }
  },
  async mounted () {
    await this.loadSongs()
  },
  methods: {
    resetDisplayLimit () {
      this.displayLimit = this.pageSize
    },
    resetFilters () {
      this.query = ''
      this.filterBy = 'all'
      this.sortBy = 'newest'
      this.resetDisplayLimit()
    },
    loadMore () {
      this.loadingMore = true
      this.displayLimit += this.pageSize
      this.$nextTick(() => { this.loadingMore = false })
    },
    async loadSongs () {
      this.loading = true
      this.loadError = null
      try {
        const response = await SongService.getSongs()
        this.songs = Array.isArray(response.data) ? response.data : []
      } catch (err) {
        this.loadError = 'We could not fetch your library right now.'
        console.error('Failed to load songs', err)
      } finally {
        this.loading = false
      }
    },
    async addSong () {
      this.addError = null
      if (!this.newSong.title || !this.newSong.artist || !this.newSong.url) {
        this.addError = 'Title, artist, and audio URL are required.'
        return
      }
      this.adding = true
      try {
        const response = await SongService.createSong(this.newSong)
        this.songs.unshift(response.data)
        this.newSong = { title: '', artist: '', album: '', url: '', coverUrl: '' }
        this.showAddForm = false
      } catch (err) {
        this.addError = 'Could not save this track. Please try again.'
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
          this.currentIndex = -1
          this.isPlaying = false
        }
      } catch (err) {
        console.error('Failed to delete song', err)
      }
    },
    playSongById (id) {
      const index = this.sortedSongs.findIndex(s => s.id === id)
      if (index === -1) return

      if (this.currentSong && this.currentSong.id === id) {
        this.togglePlay()
        return
      }

      this.currentIndex = index
      this.currentSong = this.sortedSongs[index]
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
      if (this.sortedSongs.length === 0) return
      const next = (this.currentIndex + 1) % this.sortedSongs.length
      this.currentIndex = next
      this.currentSong = this.sortedSongs[next]
      this.$nextTick(() => {
        const player = this.$refs.audioPlayer
        if (player) {
          player.volume = this.volume / 100
          player.play()
          this.isPlaying = true
        }
      })
    },
    playPrev () {
      if (this.sortedSongs.length === 0) return
      const prev = (this.currentIndex - 1 + this.sortedSongs.length) % this.sortedSongs.length
      this.currentIndex = prev
      this.currentSong = this.sortedSongs[prev]
      this.$nextTick(() => {
        const player = this.$refs.audioPlayer
        if (player) {
          player.volume = this.volume / 100
          player.play()
          this.isPlaying = true
        }
      })
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
/* ── Page shell ── */
.songs-page {
  background: #f1f5f9;
  min-height: calc(100vh - 56px);
  text-align: left;
  padding: 32px 20px 40px;
}

.songs-page.has-player {
  padding-bottom: 120px;
}

.songs-layout {
  max-width: 1080px;
  margin: 0 auto;
}

/* ── Intro ── */
.page-intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.eyebrow {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 6px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.page-lead {
  font-size: 15px;
  color: #64748b;
  margin: 0;
  max-width: 480px;
  line-height: 1.5;
}

.upload-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  border-radius: 6px !important;
  box-shadow: none !important;
}

/* ── Stats ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px 20px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.2;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

/* ── Upload panel ── */
.upload-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
}

.panel-head h2 {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px;
}

.panel-head p {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-field-wide {
  grid-column: 1 / -1;
}

.form-field >>> .v-input__slot {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
  min-height: 44px !important;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  gap: 12px;
}

.form-error {
  font-size: 13px;
  color: #dc2626;
}

/* ── Toolbar ── */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.search-wrap {
  flex: 1;
  min-width: 220px;
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  height: 44px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-wrap:focus-within {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.search-icon {
  color: #94a3b8 !important;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #0f172a;
  background: transparent;
  font-family: inherit;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #94a3b8;
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chips {
  display: flex;
  gap: 6px;
}

.chip {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.chip:hover {
  border-color: #cbd5e1;
  color: #0f172a;
}

.chip-active {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.sort-btn {
  text-transform: none !important;
  font-weight: 500 !important;
  letter-spacing: 0 !important;
  color: #475569 !important;
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px !important;
  height: 36px !important;
}

.sort-active {
  color: #2563eb;
  font-weight: 600;
}

/* ── Results bar ── */
.results-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
  padding: 0 4px;
}

.text-btn {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}

.text-btn:hover {
  text-decoration: underline;
}

/* ── Library table ── */
.library-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.table-head {
  display: grid;
  grid-template-columns: 48px 1fr 180px 160px 88px;
  gap: 12px;
  padding: 10px 20px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
}

.table-body {
  /* rows */
}

.track-row {
  display: grid;
  grid-template-columns: 48px 1fr 88px;
  gap: 12px;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
  transition: background 0.12s ease;
  position: relative;
}

.track-row:last-child {
  border-bottom: none;
}

.track-row:hover {
  background: #f8fafc;
}

.track-row-active {
  background: #f0f7ff;
}

.track-row-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #2563eb;
  border-radius: 0 2px 2px 0;
}

.track-num {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  text-align: center;
}

.playing-icon {
  animation: pulse-icon 1.2s ease-in-out infinite;
}

.track-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.track-cover {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f1f5f9;
}

.track-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-cover-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-text {
  min-width: 0;
}

.track-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist-mobile {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.track-artist,
.track-album {
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: background 0.12s ease, color 0.12s ease;
}

.icon-btn:hover:not(:disabled) {
  background: #eff6ff;
  color: #2563eb;
}

.icon-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.play-btn {
  opacity: 0;
}

.track-row:hover .play-btn,
.track-row-active .play-btn {
  opacity: 1;
}

.table-footer {
  padding: 16px;
  text-align: center;
  border-top: 1px solid #f1f5f9;
}

.load-more-btn {
  text-transform: none !important;
  font-weight: 500 !important;
  letter-spacing: 0 !important;
  color: #475569 !important;
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

/* ── States ── */
.state-view {
  padding: 24px;
}

.state-centered {
  text-align: center;
  padding: 56px 24px;
}

.state-centered h3 {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 16px 0 8px;
}

.state-centered p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px;
  max-width: 360px;
  margin-left: auto;
  margin-right: auto;
}

.state-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f1f5f9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.state-icon-error {
  background: #fef2f2;
  color: #dc2626;
}

.skeleton-table {
  padding: 8px 0;
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
}

.sk-cover {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  background: #e2e8f0;
  animation: shimmer 1.4s ease-in-out infinite;
}

.sk-lines {
  flex: 1;
}

.sk-line {
  height: 10px;
  background: #e2e8f0;
  border-radius: 4px;
  margin-bottom: 8px;
  animation: shimmer 1.4s ease-in-out infinite;
}

.sk-line-md { width: 55%; }
.sk-line-sm { width: 35%; margin-bottom: 0; }

/* ── Sticky player ── */
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  box-shadow: 0 -4px 24px rgba(15, 23, 42, 0.08);
  z-index: 100;
}

.player-bar-inner {
  max-width: 1080px;
  margin: 0 auto;
  padding: 12px 20px;
  display: grid;
  grid-template-columns: 240px 1fr 120px;
  gap: 24px;
  align-items: center;
}

.player-track {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.player-cover {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f1f5f9;
}

.player-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-cover-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-meta {
  min-width: 0;
}

.player-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-artist {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.player-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.play-main {
  width: 40px !important;
  height: 40px !important;
  background: #2563eb !important;
  color: #ffffff !important;
}

.play-main:hover {
  background: #1d4ed8 !important;
  color: #ffffff !important;
}

.player-scrub {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 480px;
}

.scrub-slider {
  flex: 1;
  margin: 0 !important;
}

.time {
  font-size: 11px;
  color: #94a3b8;
  min-width: 32px;
  font-variant-numeric: tabular-nums;
}

.player-volume {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #94a3b8;
}

.volume-slider {
  max-width: 80px;
  margin: 0 !important;
}

.player-slide-enter-active,
.player-slide-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.player-slide-enter,
.player-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

@keyframes pulse-icon {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ── Desktop table columns ── */
@media (min-width: 600px) {
  .track-row {
    grid-template-columns: 48px 1fr 180px 160px 88px;
    padding: 10px 20px;
  }

  .play-btn {
    opacity: 0;
  }
}

@media (max-width: 599px) {
  .songs-page {
    padding: 20px 16px 40px;
  }

  .page-intro {
    flex-direction: column;
    gap: 16px;
  }

  .page-title {
    font-size: 26px;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-right {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-chips {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 4px;
  }

  .chip {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .play-btn {
    opacity: 1;
  }

  .player-bar-inner {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px 16px;
  }

  .player-center {
    order: -1;
  }

  .player-track {
    justify-content: center;
    text-align: center;
    flex-direction: column;
  }

  .player-meta {
    text-align: center;
  }
}
</style>

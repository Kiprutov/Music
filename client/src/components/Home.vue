<template>
  <div class="home-page">

    <!-- ═══════════════════════════════════════════════
         HERO SECTION
    ═══════════════════════════════════════════════ -->
    <div class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge">
          <v-icon small class="badge-icon">public</v-icon>
          Kenya's Music Hub
        </div>
        <h1 class="hero-title">Download. Listen.<br>Share Everywhere.</h1>
        <p class="hero-subtitle">
          The fastest way to discover and download African music —<br>
          offline-ready, M-Pesa friendly, cyber cafe compatible.
        </p>

        <div class="hero-actions">
          <v-btn
            large
            color="white"
            class="hero-btn-primary"
            @click="navigateTo('songs')"
          >
            <span class="note-icon" aria-hidden="true">♪</span>
            Browse Music
          </v-btn>
          <v-btn
            v-if="!isLoggedIn"
            large
            outline
            color="white"
            class="hero-btn-secondary"
            @click="navigateTo('register')"
          >
            Join Free
          </v-btn>
        </div>

        <!-- Stats bar -->
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">10K+</span>
            <span class="stat-label">Songs</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">500+</span>
            <span class="stat-label">Artists</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">100%</span>
            <span class="stat-label">Offline Ready</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">M-Pesa</span>
            <span class="stat-label">Payments</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════
         QUICK ACCESS CARDS (logged in users)
    ═══════════════════════════════════════════════ -->
    <v-container v-if="isLoggedIn" class="section-container">
      <div class="section-header">
        <h2 class="section-title">Welcome back</h2>
        <p class="section-subtitle">Pick up where you left off</p>
      </div>
      <v-layout row wrap>
        <v-flex xs12 sm6 md3 v-for="card in quickCards" :key="card.title" class="pa-2">
          <div class="quick-card" @click="navigateTo(card.route)">
            <div class="quick-card-icon"><v-icon>{{ card.icon }}</v-icon></div>
            <div class="quick-card-title">{{ card.title }}</div>
            <div class="quick-card-desc">{{ card.desc }}</div>
          </div>
        </v-flex>
      </v-layout>
    </v-container>

    <!-- ═══════════════════════════════════════════════
         TRENDING SECTION
    ═══════════════════════════════════════════════ -->
    <v-container class="section-container">
      <div class="section-header">
        <h2 class="section-title">Trending Now</h2>
        <p class="section-subtitle">Most downloaded this week across Kenya</p>
      </div>

      <div v-if="loading" class="loading-state">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <p class="mt-3">Loading trending tracks...</p>
      </div>

      <div v-else class="trending-ticker-wrap">
        <div class="trending-ticker-track">
          <div
            class="trending-ticker-item"
            v-for="(song, index) in tickerItemsLoop"
            :key="`${song.title}-${song.artist}-${index}`"
          >
            <div class="ticker-rank">#{{ (index % tickerItems.length) + 1 }}</div>
            <div class="ticker-main">
              <div class="ticker-title">{{ song.title }}</div>
              <div class="ticker-sub">{{ song.artist }} • {{ song.album || 'Single' }}</div>
            </div>
            <v-btn
              icon
              small
              color="primary"
              v-if="songs.length > 0"
              @click="playSong(song)"
            >
              <v-icon>play_arrow</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <div v-if="songs.length === 0" class="empty-state compact">
        <p>No songs published yet. Start by uploading your first release.</p>
        <v-btn color="primary" dark @click="navigateTo('songs')">Upload Song</v-btn>
      </div>

      <div class="view-all-wrap">
        <v-btn flat color="primary" @click="navigateTo('songs')">
          View All Songs <v-icon right>arrow_forward</v-icon>
        </v-btn>
      </div>
    </v-container>

    <!-- ═══════════════════════════════════════════════
         FEATURES SECTION
    ═══════════════════════════════════════════════ -->
    <div class="features-section">
      <v-container class="section-container">
        <div class="section-header">
          <h2 class="section-title">Why Baze?</h2>
          <p class="section-subtitle">Built for how Kenya actually listens to music</p>
        </div>
        <v-layout row wrap>
          <v-flex xs12 sm6 md4 v-for="feature in features" :key="feature.title" class="pa-3">
            <div class="feature-card">
              <div class="feature-icon"><v-icon>{{ feature.icon }}</v-icon></div>
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-desc">{{ feature.desc }}</p>
            </div>
          </v-flex>
        </v-layout>
      </v-container>
    </div>

    <!-- ═══════════════════════════════════════════════
         CTA SECTION (logged out)
    ═══════════════════════════════════════════════ -->
    <v-container v-if="!isLoggedIn" class="section-container cta-section">
      <div class="cta-card">
        <h2 class="cta-title">Ready to download Kenya?</h2>
        <p class="cta-subtitle">Join thousands of fans and artists on Baze. It's free.</p>
        <div class="cta-actions">
          <v-btn large color="primary" dark @click="navigateTo('register')">
            Create Free Account
          </v-btn>
          <v-btn large flat color="primary" @click="navigateTo('login')">
            Sign In
          </v-btn>
        </div>
      </div>
    </v-container>

    <!-- ═══════════════════════════════════════════════
         MINI AUDIO PLAYER (when a song is selected)
    ═══════════════════════════════════════════════ -->
    <div v-if="currentSong" class="mini-player">
      <audio ref="audio" :src="currentSong.url" @ended="currentSong = null" autoplay></audio>
      <div class="mini-player-left">
        <div class="mini-cover"><v-icon color="primary">library_music</v-icon></div>
        <div class="mini-info">
          <div class="mini-title">{{ currentSong.title }}</div>
          <div class="mini-artist">{{ currentSong.artist || 'Unknown' }}</div>
        </div>
      </div>
      <div class="mini-controls">
        <v-btn icon @click="togglePlay">
          <v-icon color="primary">{{ playing ? 'pause' : 'play_arrow' }}</v-icon>
        </v-btn>
        <v-btn icon @click="currentSong = null">
          <v-icon color="grey lighten-1">close</v-icon>
        </v-btn>
      </div>
    </div>

  </div>
</template>

<script>
import SongService from '@/services/SongService'

export default {
  name: 'Home',
  data () {
    return {
      songs: [],
      loading: true,
      currentSong: null,
      playing: false,
      quickCards: [
        {
          title: 'Browse Songs',
          desc: 'Explore the full library',
          icon: 'library_music',
          route: 'songs'
        },
        {
          title: 'Download Pack',
          desc: 'Top 50 hits, one click',
          icon: 'inventory_2',
          route: 'songs'
        },
        {
          title: 'Upload Music',
          desc: 'Share your tracks',
          icon: 'cloud_upload',
          route: 'songs'
        },
        {
          title: 'My Playlist',
          desc: 'Your saved songs',
          icon: 'queue_music',
          route: 'songs'
        }
      ],
      features: [
        {
          icon: 'phone_android',
          title: 'Offline Listening',
          desc: 'Download on WiFi, listen anywhere — even with no data. Works on any Android phone.'
        },
        {
          icon: 'desktop_windows',
          title: 'Cyber Cafe Ready',
          desc: 'Cyber cafes get a local music cache. Download songs to USB in seconds, no internet needed at the counter.'
        },
        {
          icon: 'payments',
          title: 'M-Pesa Payments',
          desc: 'Buy songs, tip artists, and subscribe — all via M-Pesa STK Push. No bank account needed.'
        },
        {
          icon: 'smart_toy',
          title: 'WhatsApp Bot',
          desc: 'Text a song name, get a download link. Works on any phone. No app installation required.'
        },
        {
          icon: 'mic',
          title: 'Artist Uploads',
          desc: 'Upload your music directly. Set free or paid downloads. Get real stats on who\'s listening.'
        },
        {
          icon: 'public',
          title: 'Kenya-First',
          desc: 'Built for Afrobeats, Gengetone, Bongo, Gospel & more. Serving artists and fans across East Africa.'
        }
      ]
    }
  },
  computed: {
    isLoggedIn () {
      return this.$store.state.isUserLoggedIn
    },
    tickerItems () {
      if (this.songs.length > 0) {
        return this.songs.slice(0, 8).map(song => ({
          title: song.title || 'Untitled Track',
          artist: song.artist || 'Unknown Artist',
          album: song.album || 'Single',
          url: song.url || null
        }))
      }
      return [
        { title: 'Top New Release', artist: 'Featured Artist', album: 'This Week' },
        { title: 'Most Downloaded', artist: 'Chart Playlist', album: 'Trending' },
        { title: 'Editor Pick', artist: 'Baze Curators', album: 'Highlights' },
        { title: 'Rising Talent', artist: 'New Wave', album: 'Discovery' }
      ]
    },
    tickerItemsLoop () {
      return [...this.tickerItems, ...this.tickerItems]
    }
  },
  async mounted () {
    try {
      const response = await SongService.getSongs()
      this.songs = response.data.songs || response.data || []
    } catch (e) {
      this.songs = []
    } finally {
      this.loading = false
    }
  },
  methods: {
    navigateTo (name) {
      this.$router.push({ name })
    },
    playSong (song) {
      this.currentSong = song
      this.playing = true
    },
    togglePlay () {
      const audio = this.$refs.audio
      if (!audio) return
      if (this.playing) {
        audio.pause()
        this.playing = false
      } else {
        audio.play()
        this.playing = true
      }
    }
  }
}
</script>

<style scoped>
/* ── Global ── */
.home-page {
  background: #f8fafc;
  min-height: 100vh;
  color: #0f172a;
  font-family: 'Avenir', Arial, sans-serif;
}

.home-page .container {
  max-width: 100% !important;
  width: 100% !important;
}

/* ── Hero ── */
.hero {
  position: relative;
  min-height: 92vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  text-align: center;
  padding: 80px 24px 48px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  padding: 6px 18px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 24px;
  animation: fadeSlideDown 0.6s ease both;
}

.badge-icon {
  color: #1d4ed8 !important;
}

.hero-title {
  font-size: clamp(2.4rem, 6vw, 4.5rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 20px;
  color: #0f172a;
  animation: fadeSlideDown 0.7s ease 0.1s both;
}

.hero-subtitle {
  font-size: 1.15rem;
  color: #475569;
  line-height: 1.7;
  max-width: 560px;
  margin: 0 auto 36px;
  animation: fadeSlideDown 0.7s ease 0.2s both;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 56px;
  animation: fadeSlideDown 0.7s ease 0.3s both;
}

.hero-btn-primary {
  color: #ffffff !important;
  background: #2563eb !important;
  font-weight: 700 !important;
  border-radius: 50px !important;
  padding: 0 32px !important;
}

.note-icon {
  margin-right: 8px;
  font-size: 16px;
  line-height: 1;
}

.hero-btn-secondary {
  color: #2563eb !important;
  border-color: #93c5fd !important;
  background: #ffffff !important;
  border-radius: 50px !important;
  padding: 0 32px !important;
}

.hero-stats {
  display: inline-flex;
  gap: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 100px;
  padding: 12px 32px;
  animation: fadeSlideDown 0.7s ease 0.4s both;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px;
}

.stat-number {
  font-size: 1.1rem;
  font-weight: 800;
  color: #2563eb;
}

.stat-label {
  font-size: 0.72rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 1px;
  background: #e2e8f0;
  margin: 4px 0;
}

/* ── Sections ── */
.section-container {
  padding: 56px 24px;
}

.section-header {
  text-align: center;
  margin-bottom: 36px;
}

.section-title {
  font-size: 1.9rem;
  font-weight: 800;
  margin-bottom: 8px;
  color: #0f172a;
}

.section-subtitle {
  font-size: 1rem;
  color: #475569;
  margin: 0;
}

/* ── Quick Cards ── */
.quick-card {
  border-radius: 16px;
  padding: 28px 20px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-align: left;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.quick-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.12);
}

.quick-card-icon {
  font-size: 0;
  margin-bottom: 12px;
}

.quick-card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.quick-card-desc {
  font-size: 0.85rem;
  color: #475569;
}

/* ── Song Cards ── */
.song-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: background 0.2s ease, transform 0.2s ease;
}

.song-card:hover {
  background: #f8fafc;
  transform: translateX(4px);
}

.song-rank {
  font-size: 0.75rem;
  font-weight: 800;
  color: #94a3b8;
  min-width: 20px;
}

.song-cover {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-cover-placeholder {
  width: 100%;
  height: 100%;
  background: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 2px;
}

.song-genre {
  font-size: 0.7rem;
  color: #0f766e;
  background: #ccfbf1;
  padding: 2px 8px;
  border-radius: 100px;
  display: inline-block;
  margin-top: 4px;
}

.song-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.trending-ticker-wrap {
  position: relative;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  padding: 14px 0;
}

.trending-ticker-wrap::before,
.trending-ticker-wrap::after {
  content: '';
  position: absolute;
  top: 0;
  width: 60px;
  height: 100%;
  z-index: 2;
}

.trending-ticker-wrap::before {
  left: 0;
  background: linear-gradient(to right, #ffffff, transparent);
}

.trending-ticker-wrap::after {
  right: 0;
  background: linear-gradient(to left, #ffffff, transparent);
}

.trending-ticker-track {
  display: flex;
  gap: 12px;
  width: max-content;
  animation: tickerMove 24s linear infinite;
}

.trending-ticker-item {
  min-width: 280px;
  max-width: 280px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ticker-rank {
  min-width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.ticker-main {
  text-align: left;
  flex: 1;
  min-width: 0;
}

.ticker-title {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticker-sub {
  color: #64748b;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-all-wrap {
  text-align: center;
  margin-top: 24px;
}

/* ── Loading / Empty ── */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 24px;
  color: #64748b;
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 16px;
}

.empty-state.compact {
  padding: 18px 24px 4px;
}

/* ── Features ── */
.features-section {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.feature-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px 24px;
  height: 100%;
  transition: border-color 0.2s, background 0.2s;
}

.feature-card:hover {
  border-color: #bfdbfe;
  background: #f8fafc;
}

.feature-icon {
  font-size: 0;
  margin-bottom: 14px;
}

.feature-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.feature-desc {
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

.quick-card-icon .icon,
.feature-icon .icon {
  font-size: 28px;
  color: #2563eb;
}

/* ── CTA ── */
.cta-section {
  padding-bottom: 80px;
}

.cta-card {
  background: #ffffff;
  border: 1px solid #dbeafe;
  border-radius: 24px;
  padding: 56px 32px;
  text-align: center;
}

.cta-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 12px;
}

.cta-subtitle {
  font-size: 1rem;
  color: #475569;
  margin-bottom: 32px;
}

.cta-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* ── Mini Player ── */
.mini-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 999;
}

.mini-player-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.mini-cover {
  width: 44px;
  height: 44px;
  background: #dbeafe;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.mini-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
}

.mini-artist {
  font-size: 0.78rem;
  color: #64748b;
}

.mini-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ── Animations ── */
@keyframes fadeSlideDown {
  from {
    opacity: 0;
    transform: translateY(-18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes tickerMove {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
</style>

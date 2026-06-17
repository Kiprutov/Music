<template>
  <v-toolbar fixed class="app-toolbar" height="56">
      <v-toolbar-title class="mr-4">
        <span class="home" @click="navigateTo({name: 'root'})">
          <span class="brand-icon">♪</span>
          Music
        </span>
      </v-toolbar-title>

      <v-toolbar-items>
        <v-btn flat class="nav-btn" @click="navigateTo({name: 'songs'})">
          Browse
        </v-btn>
      </v-toolbar-items>

      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-btn
          v-if="!$store.state.isUserLoggedIn"
          flat
          class="auth-btn"
          @click="navigateTo({name: 'login'})">
          Login
        </v-btn>

        <v-btn
          v-if="!$store.state.isUserLoggedIn"
          flat
          class="auth-btn"
          @click="navigateTo({name: 'register'})">
          Sign Up
        </v-btn>

        <v-btn
          v-if="$store.state.isUserLoggedIn"
          flat
          class="auth-btn"
          @click="logout">
          Log Out
        </v-btn>
      </v-toolbar-items>
  </v-toolbar>
</template>

<script>
export default {
  methods: {
    navigateTo (route) {
      this.$router.push(route)
    },
    logout () {
      // FIX: was using this.route.dispatch (wrong) — fixed to this.$store.dispatch
      this.$store.dispatch('setToken', null)
      this.$store.dispatch('setUser', null)
      this.$router.push({ name: 'root' })
    }
  }
}
</script>

<style scoped>
.app-toolbar {
  background: #f8fbff !important;
  color: #0f172a !important;
  border-bottom: 1px solid #dbeafe;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06) !important;
}

.app-toolbar .btn,
.app-toolbar .toolbar__title {
  color: #1e3a8a !important;
}

.home {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.brand-icon {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.nav-btn,
.auth-btn {
  font-size: 12px !important;
  font-weight: 600 !important;
  letter-spacing: 0.3px !important;
}

.auth-btn:hover,
.nav-btn:hover {
  background: #eff6ff !important;
}
</style>

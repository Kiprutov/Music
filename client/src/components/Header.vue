<template>
  <v-toolbar fixed class="cyan" dark>
      <v-toolbar-title class="mr-4">
        <span
        class="home"
          @click="navigateTo({name: 'root'})">
          Music
        </span>
      </v-toolbar-title>

      <v-toolbar-items>
        <v-btn 
          flat
          @click="navigateTo({name: 'songs'})">
          Browse
        </v-btn>
      </v-toolbar-items>

      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-btn
          v-if="!$store.state.isUserLoggedIn"
          flat
          @click="navigateTo({name: 'login'})">
          login
        </v-btn>
   
        <v-btn 
          v-if="!$store.state.isUserLoggedIn"
          flat
          @click="navigateTo({name: 'register'})">
          Sign Up
        </v-btn>

        <v-btn 
          v-if="$store.state.isUserLoggedIn"
          flat
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
      this.route.dispatch('setToken', null)
      this.route.dispatch('setUser', null)
      //redirect to homepage
      this.$router.push({
        name: 'root'
      })
    }
  }
}
</script>

<style scoped>
.home {
  cursor: pointer;
}
</style>

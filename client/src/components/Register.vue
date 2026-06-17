<template>
<v-container class="auth-page">
 <v-layout text-xs-center wrap>
   <v-flex xs6 offset-xs3>
     <panel title="Register">
         <form
          name="music-form"
          autocomplete="off">
          <v-text-field
            label="Email"
            v-model="email"
          ></v-text-field>
          <br>
          <v-text-field
            label="password"
            type="password"
            v-model="password"
            autocomplete="new-password"
          ></v-text-field>
         </form>
         <br>
         <div class="error" v-html="error" />
         <br>
         <v-btn
           class="primary-btn"
           @click="register" dark>
           Register
         </v-btn>
     </panel>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
import AuthenticationService from '@/services/AuthenticationService'
import Panel from '@/components/Panel'
export default {
  data () {
    return {
      email: '',
      password: '',
      error: null
    }
  },
  methods: {
    async register () {
      try {
        const response = await AuthenticationService.register({
          email: this.email,
          password: this.password
        })
        this.$store.dispatch('setToken', response.data.token)
        this.$store.dispatch('setUser', response.data.user)
        this.$router.push({ name: 'root' })
      } catch (error) {
        this.error = error.response.data.error
      }
    }
  },
  components: {
    Panel
  }
}
</script>

<style scoped>
.error {
  color: #dc2626;
}

.auth-page {
  background: #f8fafc;
  min-height: calc(100vh - 60px);
  padding-top: 36px;
}

.primary-btn {
  background: #2563eb !important;
}
</style>

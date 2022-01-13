<template>
<div>
  <template v-if="$store.state.accessToken !== ''">
    <v-app>
      <appbar @toggleNavigationBar="drawer = !drawer"></appbar>
      <navigation :toggle="drawer"></navigation>
      <v-content>
        <v-container fluid>
          <router-view></router-view>
        </v-container>
      </v-content>
    </v-app>
  </template>
  <template v-else>
    <transition>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </transition>
  </template>
</div>
</template>

<script>
import navigation from '@/components/NavigationDrawer'
import appbar from '@/components/AppBar'

export default {
  components: {
    navigation,
    appbar
  },
  data() {
    return {
      drawer: true
    }
  },
  mounted() {
    console.log(process.env)
  }
}
</script>

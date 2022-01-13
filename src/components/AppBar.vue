<template>
<v-app-bar color="indigo" app dark fixed>
  <v-app-bar-nav-icon @click.stop="toggleNavigationBar"></v-app-bar-nav-icon>
  <v-toolbar-title>Finance Management</v-toolbar-title>
</v-app-bar>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    toggleNavigationBar() {
      const vm = this;
      vm.$emit('toggleNavigationBar');
    }
  }
}
</script>

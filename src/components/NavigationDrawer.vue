<template>
<v-navigation-drawer v-model="toggle" app fixed color='indigo' dark>
  <v-row align="center" justify="center">
    <v-col>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">
            {{this.$store.state.name}}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{this.$store.state.email}}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-col>
    <v-col>
      <div>
        <v-icon @click="logOut()">mdi-logout</v-icon>
      </div>
    </v-col>
  </v-row>
  <v-divider></v-divider>
  <v-list dense>
    <v-list-item-group>
      <v-list-item v-for="menuitem in menuitems" :key="menuitem.menuName" :to="menuitem.url">
        <v-list-item-content>
          <v-list-item-title>{{menuitem.menuName}}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list-item-group>
  </v-list>
</v-navigation-drawer>
</template>

<script>
import axios from 'axios'

export default {
  props: {
    toggle: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      menuitems: []
    }
  },
  created() {
    let role = '';
    if (this.$store.state.role == "ADMIN") {
      role = 'ADMIN';
    } else {
      role = 'NORMAL';
    }

    axios.get('/api/v1/menu/getMenuList?menuType=' + role).then((response) => {
      console.warn(response);
      this.menuitems = response.data
    })
  },
  methods: {
    logOut(){
      this.$cookies.remove("dhgToken")
      this.$store.commit('logout');
      this.$router.push("/login");
    }
  }
}
</script>

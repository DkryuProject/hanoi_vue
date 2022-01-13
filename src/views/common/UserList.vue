<template>
<v-card>
  <v-card-title>User Info</v-card-title>
  <v-card-title>
    <v-text-field v-model="searchKeyWord" append-icon="search" label="Search" single-line hide-details @keyup.enter="getItem()"></v-text-field>
    <v-spacer></v-spacer>
    <div>
      <v-btn @click="confirm()">Confirm</v-btn>
      <v-btn v-show="this.$store.state.role == 'ADMIN'" @click="deleteData()">Delete</v-btn>
    </div>
  </v-card-title>
  <v-divider></v-divider>
  <v-data-table v-model="selectedData" height="600px" fixed-header :headers="headers" :items="details" :items-per-page="10" :search="search" :single-select="false" :options.sync="options" :server-items-length="totalItem" item-key="userId" show-select>
  </v-data-table>
</v-card>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      searchKeyWord: '',
      totalItem: 0,
      options: {},
      search: '',
      headers: [],
      details: [],
      selectedData: []
    }
  },
  created() {
    axios.get('/api/v1/screen/getHeaders?screenId=USER').then((response) => {
      console.warn(response);
      this.headers = response.data
    });
  },
  watch: {
    options: {
      handler() {
        this.getItem();
      },
      deep: true,
    }
  },
  methods: {
    getItem() {
      let {
        page,
        itemsPerPage
      } = this.options;

      if (itemsPerPage == -1) {
        itemsPerPage = process.env.VUE_APP_MAX_PER_SIZE;
      }

      axios.get('/api/v1/login/userList', {
          params: {
            searchKeyWord: this.searchKeyWord,
            page: page - 1,
            size: itemsPerPage
          }
        })
        .then((response) => {
          this.details = response.data.content;
          this.totalItem = response.data.totalElements;
        })
    },
    confirm() {
      if (this.selectedData.length == 0) {
        alert("No Selected");
        return;
      }
      if (confirm('Are you confirm?')) {
        var jsondata = JSON.stringify(this.selectedData);
        axios.post('/api/v1/login/confirmUser', jsondata).then((response) => {
            console.warn(response);
            alert("Confirm Success");
            this.getItem();
          })
          .catch((ex) => {
            alert("ERROR!!!!! : ", ex)
          })
      }
    },
    deleteData() {
      if (confirm('Are you deleted?')) {
        var jsondata = JSON.stringify(this.selectedData);
        axios.post('/api/v1/login/deleteUser', jsondata).then((response) => {
            console.warn(response);
            alert("Deleted Success");
            this.getItem();
          })
          .catch((ex) => {
            alert("ERROR!!!!! : ", ex)
          })
      }
    }
  }
}
</script>

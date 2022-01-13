<template>
<v-card>
  <v-card-title>Company Info</v-card-title>
  <v-card-title>
    <v-text-field v-model="searchKeyWord" append-icon="search" label="Search" single-line hide-details @keyup.enter="getItem()"></v-text-field>
    <v-spacer></v-spacer>
    <div>
      <v-btn @click="$router.push('/companyInfoRegister')">NEW</v-btn>
      <v-btn @click="modifyData()">MOD</v-btn>
      <v-btn v-show="this.$store.state.role == 'ADMIN'" @click="deleteData()">DEL</v-btn>
    </div>
  </v-card-title>
  <v-divider></v-divider>
  <v-data-table v-model="selectedData" height="600px" fixed-header :headers="headers" :items="companyDetail" :items-per-page="10" :search="search" :single-select="false" :options.sync="options" :server-items-length="totalItem" item-key="companyCode"
    :footer-props="footerProps" show-select>
  </v-data-table>
</v-card>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      footerProps: {
        'items-per-page-options': [10, 50, 100]
      },
      searchKeyWord: '',
      totalItem: 0,
      options: {},
      search: '',
      headers: [],
      companyDetail: [],
      selectedData: []
    }
  },
  created() {
    axios.get('/api/v1/screen/getHeaders?screenId=COMPANY').then((response) => {
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
  mounted() {},
  methods: {
    getItem() {
      let {
        page,
        itemsPerPage
      } = this.options;

      if (itemsPerPage == -1) {
        itemsPerPage = process.env.VUE_APP_MAX_PER_SIZE;
      }

      axios.get('/api/v1/company/getItem', {
          params: {
            searchKeyWord: this.searchKeyWord,
            page: page - 1,
            size: itemsPerPage,
            sort: 'companyCode'
          }
        })
        .then((response) => {
          this.companyDetail = response.data.content;
          this.totalItem = response.data.totalElements;
        })
    },
    modifyData() {
      if (this.selectedData.length == 0) {
        alert("No Selected");
        return;
      }
      this.$router.push({
        name: 'companyInfoRegister',
        params: {
          docType: 'mod',
          detailItem: this.selectedData
        }
      })
    },
    deleteData() {
      if (confirm('Are you deleted?')) {
        var jsondata = JSON.stringify(this.selectedData);
        axios.post('/api/v1/company/deleteList', jsondata).then((response) => {
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

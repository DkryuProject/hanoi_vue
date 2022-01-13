<template>
<v-layout row justify-center>
  <v-dialog v-model="commonModal" persistent max-width="100%" :value="commonModal" @keydown.esc="closeModal()">
    <v-card>
      <v-toolbar dark color="primary">
        <v-toolbar-title> Select {{getType}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="closeModal()">X</v-btn>
      </v-toolbar>
      <v-divider></v-divider>
      <v-card-title>
        <v-text-field v-model="searchKeyWord" append-icon="search" label="Search" single-line hide-details @keyup.enter="getItem()"></v-text-field>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table height="600px" fixed-header :headers="commonHeaders" :items="commonItems" :items-per-page="10" :search="search" :options.sync="options" :server-items-length="totalItem" :footer-props="footerProps" @click:row="rowClick">
      </v-data-table>
    </v-card>
  </v-dialog>
</v-layout>
</template>

<script>
import axios from 'axios'
export default {
  props: {
    setDialog: {
      type: Object
    }
  },
  data() {
    return {
      footerProps: {
        'items-per-page-options': [10, 50, 100]
      },
      searchKeyWord: '',
      totalItem: 0,
      options: {},
      search: '',
      commonHeaders: [{
          text: 'Account Code',
          value: 'accountCode',
          align: 'center',
          width: '15%',
          sortable: false
        },
        {
          text: 'Currency',
          value: 'currency',
          align: 'center',
          width: '15%',
          sortable: false
        },
        {
          text: 'Subject',
          value: 'subject',
          width: '70%',
          sortable: false
        }
      ],
      commonItems: []
    }
  },
  computed: {
    commonModal() {
      return this.setDialog.dialog
    },
    getType() {
      return this.setDialog.type
    }
  },
  watch: {
    getType: {
      handler: function(value) {
        if (value) {
          this.getItem();
        }
      }
    },
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

      axios.get('/api/v1/accountInfo/getItem', {
          params: {
            searchKeyWord: this.searchKeyWord,
            page: page - 1,
            size: itemsPerPage,
            sort: 'accountCode'
          }
        })
        .then((response) => {
          this.commonItems = response.data.content;
          this.totalItem = response.data.totalElements;
        })
    },
    closeModal() {
      this.$emit('close');
    },
    reset() {
      Object.assign(this.$data, this.$options.data());
    },
    rowClick(rowItem) {
      this.$emit('transData', rowItem);
    }
  }
}
</script>

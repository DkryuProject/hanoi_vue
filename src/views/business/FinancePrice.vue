<template>
<v-card>
  <v-card-title>Item Cost Lists</v-card-title>
  <v-card-title>
    <v-row>
      <v-col cols="12" sm="4">
        <v-text-field v-model="searchKeyWord" append-icon="search" label="Search" single-line hide-details @keyup.enter="getItem()"></v-text-field>
      </v-col>
    </v-row>
  </v-card-title>
  <v-divider></v-divider>
  <v-data-table height="600px" fixed-header v-model="selectedData" :headers="headers" :items="priceDetail" :items-per-page="10" :search="search" :single-select="false" :options.sync="options" :server-items-length="totalItem"
    item-key="accountCurrency" :footer-props="footerProps">
    <template v-slot:item="{item}">
      <tr>
        <td class="text-center">
          {{item[0]}}
        </td>
        <td class="text-center">
          {{item[1].companyName}}
        </td>
        <td class="text-center">
          {{item[2].subCategoryName}}
        </td>
        <td class="text-center">
          {{item[2].supplier}}
        </td>
        <td class="text-center">
          {{item[2].currency}}
        </td>
        <td class="text-center">
          {{item[2].unitMeasurement}}
        </td>
        <td class="text-right">
          {{item[2].amount | currency}}
        </td>
        <td class="text-right">
          {{getExchange(item[2].amount) | currency}}
        </td>
        <td class="text-right">
          {{item[2].quantity | currency}}
        </td>
        <td class="text-right lighten-2">
          {{calculateLineTotal(item[2]) | currency}}
        </td>
        <td class="text-right">
          {{getExchange(calculateLineTotal(item[2]) ) | currency}}
        </td>
      </tr>
    </template>
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
      priceDetail: [],
      selectedData: [],
      exchageData: []
    }
  },
  created() {
    this.getExchageData();
    axios.get('/api/v1/screen/getHeaders?screenId=FINANCEPRICE').then((response) => {
      console.warn(response);
      this.headers = response.data
    });
  },
  watch: {
    options: {
      handler() {
        console.log("Finance Price List options Watch");
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
      axios.get('/api/v1/financeDetail/getFinancePriceList', {
          params: {
            searchKeyWord: this.searchKeyWord,
            page: page - 1,
            size: itemsPerPage,
            sort: 'id'
          }
        })
        .then((response) => {
          this.priceDetail = response.data.content;
          this.totalItem = response.data.totalElements;
        })
    },
    calculateLineTotal(item) {
      var amount = item.amount + "";
      var quantity = item.quantity + "";
      var total = 0;
      if (item.quantity !== 0) {
        total = parseFloat(amount.replace(/,/g, "")) / parseFloat(quantity.replace(/,/g, ""));
      }

      return total;
    },
    getExchageData() {
      axios.get('https://earthquake.kr:23490/query/USDKRW,USDVND,VNDUSD,VNDKRW,KRWUSD,KRWVND')
        .then((response) => {
          console.warn(response);
          this.exchageData = response.data
        })
    },
    getExchange(amount) {
      return amount * this.exchageData.VNDUSD[0];
    }
  }
}
</script>

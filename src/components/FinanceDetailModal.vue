<template>
<v-layout row justify-center>
  <v-dialog v-model="financeDetailModal" persistent max-width="100%" :value="financeDetailModal" @keydown.esc="closeModal()">
    <v-card>
      <v-toolbar dark color="primary">
        <v-toolbar-title> Finance Detail View</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="closeModal()">X</v-btn>
      </v-toolbar>
      <v-row>
        <v-col class="d-flex justify-start align-center pa-3" cols="12" sm="3">
          <v-menu ref="dateShow" v-model="dateShow" :close-on-content-click="false" :return-value.sync="fromtoDate" transition="scale-transition" offset-y min-width="290px">
            <template v-slot:activator="{ on }">
              <v-text-field v-model="fromtoDate" prepend-icon="event" readonly dense v-on="on" hide-details></v-text-field>
            </template>
            <v-date-picker v-model="dates" range no-title>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="getitem()">OK</v-btn>
            </v-date-picker>
          </v-menu>
        </v-col>
      </v-row>
      <v-divider></v-divider>
      <v-data-table height="600px" fixed-header :headers="financeDetailHeaders" :items="financeDetailItems" :items-per-page="10" :search="search" :options.sync="options" :server-items-length="totalItem" :group-by="groupBy"
        :footer-props="footerProps">
        <template v-slot:group.header="props">
          <th v-if="props.group !== 'undefined'" :colspan="props.headers.length" style="text-align: justify">
            <v-row>
              <v-col>
                <span style="font-weight:bold;font-size:medium"> {{props.group.toUpperCase()}} Balance {{totalBalance | currency}}</span>
              </v-col>
            </v-row>
          </th>
        </template>
        <template v-slot:item.accountInfo="{ item }">
          {{item.accountCode.subject}} / {{item.accountCode.accountCode}}
        </template>
        <template v-slot:item.companyName="{ item }">
          {{item.companyCode.companyName}}
        </template>
        <template v-slot:item.docNo="{ item }">
          <v-chip v-if="item.subRowFlag == 'N'" color="cyan" label>
            {{item.docNo}}
          </v-chip>
          <v-chip v-else color="cyan lighten-5" label>
            {{item.docNo}}
          </v-chip>
        </template>
        <template v-slot:item.debit="{ item }">
          {{item.debit | currency}}
        </template>
        <template v-slot:item.credit="{ item }">
          {{item.credit | currency}}
        </template>
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
      dates: [],
      dateShow: false,
      totalItem: 0,
      options: {},
      search: '',
      totalBalance: 0,
      financeDetailHeaders: [],
      financeDetailItems: []
    }
  },
  created() {
    axios.get('/api/v1/screen/getHeaders?screenId=FINANCE').then((response) => {
      console.warn(response);
      this.financeDetailHeaders = response.data
    });
  },
  computed: {
    financeDetailModal() {
      return this.setDialog.dialog;
    },
    groupBy() {
      var returnVal = null;
      if (this.setDialog.type == "docNo") {
        returnVal = "";
      } else if (this.setDialog.type == "accountCode") {
        returnVal = "currency";
      } else if (this.setDialog.type == "companyCode") {
        //returnVal = "accountNameCurrency";
        returnVal = "";
      }
      return returnVal;
    },
    fromtoDate() {
      return this.dates.join(' ~ ')
    }
  },
  watch: {
    options: {
      handler() {
        this.getitem();
      },
      deep: true,
    }
  },
  methods: {
    getitem() {
      this.dateShow = false;

      const {
        page,
        itemsPerPage
      } = this.options;

      var dataObj = {};
      dataObj.selectCode = this.setDialog.selectCode;
      dataObj.selectType = this.setDialog.type;

      var pageObj = {};
      pageObj.pageNum = page - 1;
      pageObj.size = itemsPerPage;
      pageObj.sort = "docNo";

      var jsondata = {};
      jsondata.data = dataObj;
      jsondata.page = pageObj;
      jsondata.fromtoDate = this.dates;

      axios.post('/api/v1/financeDetail/getItem', JSON.stringify(jsondata))
        .then((response) => {
          this.financeDetailItems = response.data.content;
          this.totalItem = response.data.totalElements;
        })

      axios.get('/api/v1/financeDetail/totalBalance/'+this.setDialog.selectCode).then((response) => {
        this.totalBalance = response.data;
      })  
    },
    closeModal() {
      this.dates = [];
      this.$emit('close');
    },
    reset() {
      Object.assign(this.$data, this.$options.data());
    },
    sumBalance(items) {
      var result = 0;
      for (var i = 0; i < items.length; i++) {
        result += (parseFloat(items[i].debit) - parseFloat(items[i].credit));
      }
      return result;
    }
  }
}
</script>

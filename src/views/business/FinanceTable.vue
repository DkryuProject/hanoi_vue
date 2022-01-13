<template>
<v-card>
  <v-card-title>Finance Overview</v-card-title>
  <v-card-title>
    <v-row>
      <v-col class="d-flex align-center pa-1" cols="12" sm="4">
        <v-text-field v-model="accountName" readonly solo dense hide-details @click.left="commonModalPopup('account')" append-icon="mdi-eraser" @click:append="removeInput()"></v-text-field>
        <input type="hidden" v-model="accountCode" />
      </v-col>
      <v-col class="d-flex align-center pa-1" cols="12" sm="4">
        <v-menu ref="dateShow" v-model="dateShow" :close-on-content-click="false" :return-value.sync="fromtoDate" transition="scale-transition" offset-y min-width="290px">
          <template v-slot:activator="{ on }">
            <v-text-field v-model="fromtoDate" prepend-icon="event" readonly dense v-on="on" hide-details></v-text-field>
          </template>
          <v-date-picker v-model="dates" range no-title>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="getItem()">OK</v-btn>
          </v-date-picker>
        </v-menu>
      </v-col>
    </v-row>
    <v-spacer></v-spacer>
  </v-card-title>
  <v-divider></v-divider>
  <modalDialog :setDialog="this.modalDialog" @close="closeDialog" @transData="transData"></modalDialog>
  <financeDetailDialog :setDialog="this.financeDetailDialog" @close="closeFinanceDetailDialog"></financeDetailDialog>
  <priceDetailDialog :setDialog="this.priceDetailDialog" @close="closePriceDetailModal"></priceDetailDialog>
  <v-row v-if="this.accountCode !== ''">
    <v-col class="d-flex align-center pa-2" cols="12" sm="4">
      <v-card-title>Balance: {{totalBalance | currency}}</v-card-title>
    </v-col>
  </v-row>
  <v-data-table height="600px" fixed-header id="finanaceTable" :headers="headers" :items="financeitem" :items-per-page="10" :search="search" :options.sync="options" :server-items-length="totalItem" :footer-props="footerProps">
    <template v-slot:item.debit="{ item }">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <span v-on="on">{{item.debit | currency}}</span>
        </template>
        <span>{{getExchange(item,'debit')}}</span>
      </v-tooltip>
    </template>
    <template v-slot:item.credit="{ item }">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <span v-on="on">{{item.credit | currency}}</span>
        </template>
        <span>{{getExchange(item,'credit')}}</span>
      </v-tooltip>
    </template>
    <template v-slot:item.balance="{ item }">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <span v-on="on">{{item.balance | currency}}</span>
        </template>
        <span>{{getExchange(item,'balance')}}</span>
      </v-tooltip>
    </template>
    <template v-slot:item.docNo="{ item }">
      <font color="blue" v-on:click="modalPopup('docNo', item.docNo)">{{item.docNo}}</font>
    </template>
    <template v-slot:item.accountInfo="{ item }">
      <font color="blue" v-on:click="modalPopup('accountCode', item.accountCode.accountCode)">{{item.accountCode.subject}} / {{item.accountCode.accountCode}}</font>
    </template>
    <template v-slot:item.companyName="{ item }">
      <font color="blue" v-on:click="modalPopup('companyCode', item.companyCode.companyCode)">{{item.companyCode.companyName}}</font>
    </template>
    <template v-slot:item.price="{ item }">
      {{item.price | currency}}
    </template>
    <template v-slot:item.amount="{ item }">
      {{item.amount | currency}}
    </template>
    <template v-slot:item.referenceDocNo="{ item }">
      <font color="blue" @click="priceDetailModal(item)">{{financePriceDetailsSum(item.financePriceDetails) | currency}}</font>
    </template>
  </v-data-table>
</v-card>
</template>

<script>
import axios from 'axios'
import modalDialog from '@/components/CommonModal'
import financeDetailDialog from '@/components/FinanceDetailModal'
import priceDetailDialog from '@/views/business/FinancePriceDetail'

export default {
  components: {
    modalDialog,
    financeDetailDialog,
    priceDetailDialog
  },
  data() {
    return {
      footerProps: {
        'items-per-page-options': [10, 50, 100]
      },
      dates: [],
      dateShow: false,
      modalDialog: {
        dialog: false,
        type: ''
      },
      financeDetailDialog: {
        dialog: false,
        type: null,
        selectCode: null
      },
      priceDetailDialog: {
        dialog: false,
        items: null,
        type: null
      },
      totalItem: 0,
      totalBalance: 0,
      options: {},
      search: '',
      accountCode: '',
      accountName: '',
      headers: [],
      financeitem: [],
      exchageData: []
    }
  },
  computed: {
    fromtoDate() {
      return this.dates.join(' ~ ')
    }
  },
  watch: {
    options: {
      handler() {
        this.getItem();
      },
      deep: true,
    }
  },
  created() {
    this.getExchageData();
    axios.get('/api/v1/screen/getHeaders?screenId=FINANCETABLE').then((response) => {
      console.warn(response);
      this.headers = response.data;
    });
  },
  methods: {
    getItem() {
      this.dateShow = false;

      let loader = this.$loading.show({
        loader: 'dots'
      });

      let {
        page,
        itemsPerPage
      } = this.options;

      var type = "";
      if (this.accountCode !== "") {
        type = "accountCode";
      }

      if (itemsPerPage == -1) {
        itemsPerPage = process.env.VUE_APP_MAX_PER_SIZE;
      }

      var dataObj = {};
      dataObj.selectCode = this.accountCode;
      dataObj.selectType = type;

      var pageObj = {};
      pageObj.pageNum = page - 1;
      pageObj.size = itemsPerPage;
      pageObj.sort = "docNo";

      var jsondata = {};
      jsondata.data = dataObj;
      jsondata.page = pageObj;
      jsondata.fromtoDate = this.dates;

      axios.post('/api/v1/financeDetail/getItem', JSON.stringify(jsondata)).then((response) => {
        loader.hide();
        console.warn(response);
        this.financeitem = response.data.content;
        this.totalItem = response.data.totalElements;

        if (this.accountCode != "") {
          var balance = 0;
          for (var i = 0; i < this.financeitem.length; i++) {
            this.financeitem[i].balance = balance;
            balance = parseFloat(this.financeitem[i].balance);
          }
        }
      })
      if(this.accountCode != null){
        axios.get('/api/v1/financeDetail/totalBalance/'+this.accountCode).then((response) => {
          this.totalBalance = response.data;
        })  
      }
    },
    getExchageData() {
      axios.get('https://earthquake.kr:23490/query/USDKRW,USDVND,VNDUSD,VNDKRW,KRWUSD,KRWVND')
        .then((response) => {
          console.warn(response);
          this.exchageData = response.data
        })
    },
    getExchange(item, type) {
      var originalData = 0;
      var currency = '';
      var result = 0;
      var idx = 0;

      if (type == "debit") {
        originalData = item.debit;
      } else if (type == "credit") {
        originalData = item.credit;
      } else if (type == "balance") {
        originalData = item.balance;
      }

      currency = item.currency;

      if (currency == "KRW") {
        result = "USD: " + (originalData * this.exchageData.KRWUSD[idx]).toFixed(2);
      } else if (currency == "VND") {
        result = "USD: " + (originalData * this.exchageData.VNDUSD[idx]).toFixed(2) + " KRW: " + (originalData * this.exchageData.VNDKRW[idx]);
      } else if (currency == "USD") {
        result = "VND: " + (originalData * this.exchageData.USDVND[idx]) + " KRW: " + (originalData * this.exchageData.USDKRW[idx]);
      }
      return result;
    },
    commonModalPopup(type) {
      this.modalDialog.dialog = true;
      this.modalDialog.type = type;
    },
    modalPopup(type, selectCode) {
      this.financeDetailDialog.dialog = true;
      this.financeDetailDialog.type = type;
      this.financeDetailDialog.selectCode = selectCode;
    },
    closeDialog() {
      this.modalDialog.dialog = false;
      this.modalDialog.type = "";
    },
    closeFinanceDetailDialog() {
      this.financeDetailDialog.dialog = false;
      this.financeDetailDialog.type = null;
      this.financeDetailDialog.selectCode = null;
    },
    transData(item) {
      this.accountCode = item.accountCode;
      this.accountName = item.subject;
      this.modalDialog.dialog = false;
      this.$forceUpdate();
      this.getItem();
    },
    removeInput() {
      this.accountCode = "";
      this.accountName = "";
      this.getItem();
    },
    priceDetailModal(item) {
      this.priceDetailDialog.dialog = true;
      this.priceDetailDialog.type = "view";
      this.priceDetailDialog.items = item;
    },
    closePriceDetailModal() {
      this.priceDetailDialog.dialog = false;
    },
    financePriceDetailsSum(items) {
      var sum = 0;
      for (var i = 0; i < items.length; i++) {
        sum += parseFloat(items[i].amount);
      }
      return sum;
    }
  }
}
</script>

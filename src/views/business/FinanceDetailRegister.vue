<template>
<v-card>
  <v-card-title>
    Finance Journal Entry
    <div style="position:relative;left:10px;">
      <span v-if="docType != 'mod'">Register</span>
      <span v-else>Modify</span>
    </div>
    <v-spacer></v-spacer>
    <div>
      <v-btn v-show="docType != 'mod'" @click="addNewRow">Add Row</v-btn>
      <v-btn @click="saveInvoice">SAVE</v-btn>
    </div>
  </v-card-title>
  <v-divider></v-divider>
  <commonDialog :setDialog="this.setDialog" @close="closeDialog" @transData="transData"></commonDialog>
  <priceDetailDialog :setDialog="this.priceDetailDialog" @close="closePriceDetailModal" @setPriceItems="setPriceItems"></priceDetailDialog>
  <v-data-table height="700px" fixed-header :headers="headers" :items="items" hide-default-footer :items-per-page="1000">
    <template v-slot:item="{item}">
      <tr>
        <td>
          <div class="pa-0">
            <span v-if="item.subRowFlag == 'N'">
              <v-icon @click="divisionRow(k, item)">mdi-tray-plus</v-icon>
            </span>
          </div>
        </td>
        <td>
          <div class="pa-0">
            <span v-if="item.subRowFlag == 'N'">
              <v-icon @click="deleteRow(k, item)">mdi-trash-can</v-icon>
            </span>
            <span v-else>
              <v-icon @click="deleteRow(k, item)">mdi-trash-can</v-icon>
            </span>
          </div>
        </td>
        <td class="pa-0">
          <input type="hidden" v-model="item.insertUser" />
          <v-menu v-model="item.menu" :close-on-content-click="false" :return-value.sync="date" transition="scale-transition" offset-y min-width="290px">
            <template v-slot:activator="{ on }">
              <v-text-field v-model="item.date" readonly solo dense v-on="on" hide-details></v-text-field>
            </template>
            <v-date-picker v-model="item.date" no-title @input="item.menu = false"></v-date-picker>
          </v-menu>
        </td>
        <td class="pa-0">
          <v-text-field v-if="item.subRowFlag == 'Y'" v-model="item.docNo" readonly solo dense hide-details background-color="cyan lighten-5"></v-text-field>
          <v-text-field v-else v-model="item.docNo" readonly solo dense hide-details background-color="cyan"></v-text-field>
        </td>
        <td class="pa-0">
          <v-text-field v-model="item.typeName" readonly solo dense hide-details></v-text-field>
          <input type="hidden" v-model="item.type" />
        </td>
        <td class="pa-0">
          <v-text-field v-model="item.accountCode.subject" readonly solo dense hide-details @click.left="modalPopup('Account', item)"></v-text-field>
          <input type="hidden" v-model="item.accountCode" />
        </td>
        <td class="pa-0">
          <v-autocomplete v-model="item.companyCode" :items="company_codes" item-text="companyName" item-value="companyCode" persistent-hint single-line solo dense hide-details return-object></v-autocomplete>
        </td>
        <td class="pa-0">
          <v-autocomplete v-model="item.currency" :items="currency_codes" item-text="codeName" item-value="code" persistent-hint single-line solo dense hide-details></v-autocomplete>
        </td>
        <td class="pa-0">
          <v-card>
            <money v-model="item.debit" v-bind="money" :disabled="item.debitDisable" class="form-input input-lg" @input="typeChange(item)"></money>
          </v-card>
        </td>
        <td class="pa-0">
          <v-card>
            <money v-model="item.credit" v-bind="money" :disabled="item.creditDisable" class="form-input input-lg" @input="typeChange(item)"></money>
          </v-card>
        </td>
        <td class="pa-0">
          <v-text-field v-model="item.description" solo dense hide-details></v-text-field>
        </td>
        <td class="pa-0" align="center">
          <font color="blue" v-model="item.financePriceDetails" @click="priceDetailModal(item)">{{financePriceDetailsSum(item.financePriceDetails) | currency}}</font>
        </td>
        <td class="pa-0">
          <v-text-field v-model="item.insertUserName" solo dense hide-details></v-text-field>
        </td>
      </tr>
    </template>
  </v-data-table>
</v-card>
</template>

<script>
import axios from 'axios'
import commonDialog from '@/components/CommonModal'
import priceDetailDialog from '@/views/business/FinancePriceDetail'

export default {
  components: {
    commonDialog,
    priceDetailDialog
  },
  data: function() {
    return {
      type: null,
      selectedItem: null,
      docType: '',
      docNo: [],
      date: new Date().toISOString().substr(0, 10),
      setDialog: {
        dialog: false,
        type: null
      },
      priceDetailDialog: {
        dialog: false,
        items: null,
        type: null
      },
      headers: [],
      items: [],
      type_codes: [],
      company_codes: [],
      currency_codes: [],
      money: {
        decimal: '.',
        thousands: ',',
        prefix: '',
        suffix: '',
        precision: 2,
        masked: false /* doesn't work with directive */
      }
    }
  },
  created() {
    this.getCodes('type');
    this.getCodes('currency');
    this.getCompany();
    this.docType = this.$route.params.docType;
    this.docNo = this.$route.params.docNo;

    axios.get('/api/v1/screen/getHeaders?screenId=FINANCE').then((response) => {
      console.warn(response);

      var obj = new Object();
      obj.text = " ";
      obj.width = "5px";
      obj.fixed = true;

      this.headers = response.data;

      this.headers.splice(0, 0, obj);
      this.headers.splice(0, 0, obj);
    });
  },
  watch: {
    docType: {
      handler: function(value) {
        if (value == "mod") {
          console.log(this.docNo);
          this.getData(this.docNo);
        }
      }
    }
  },
  methods: {
    getCodes(val) {
      var jsondata = JSON.stringify({
        type: val
      });
      axios.post('/api/v1/code/getItem', jsondata).then((response) => {
        console.warn(response);
        if (val == "type") {
          this.type_codes = response.data
        } else if (val == "company") {
          this.company_codes = response.data
        } else if (val == "currency") {
          this.currency_codes = response.data
        }
      })
    },
    getCompany() {
      axios.get('/api/v1/company/getList')
        .then((response) => {
          this.company_codes = response.data;
        })
    },
    saveInvoice() {
      var url = "";

      if (this.validation(this.items)) return;

      if (confirm('Are you saved?')) {
        if (this.docType == "mod") {
          url = "/api/v1/financeDetail/update";
        } else {
          url = "/api/v1/financeDetail/insert";
        }
        axios.post(url, JSON.stringify(this.items)).then(response => {
            console.warn(response)
            this.result = response.data
            this.no = response.data.no
            this.$router.go(-1)
          })
          .catch((ex) => {
            console.warn("ERROR!!!!! : ", ex)
            alert("ERROR!!!!! : ", ex)
          })
      }
    },
    calculateLineTotal(item) {
      var total = parseFloat(item.price.replace(/,/g, "")) * parseFloat(item.qty);
      if (!isNaN(total)) {
        item.amount = total.toFixed(2);
      }
    },
    deleteRow(index, item) {
      if (this.docType == "mod") {
        console.log("delete row mod");

        if (confirm('Are you deleted?')) {
          var jsondata = JSON.stringify(item);
          console.log(jsondata);
          axios.post('/api/v1/financeDetail/deleteDocNoAndNum', jsondata).then((response) => {
              console.warn(response);
              alert("Deleted Success");
              this.getData(this.docNo);
            })
            .catch((ex) => {
              alert("ERROR!!!!! : ", ex)
            })
        }
      } else {
        var idx = this.items.indexOf(item);
        if (idx > -1) {
          this.items.splice(idx, 1);
        }
      }
    },
    addNewRow() {
      var val = null;
      axios.get('/api/v1/documentNumber/getData')
        .then((response) => {
          console.warn(response);
          val = response.data;
          this.items.push({
            docNo: val,
            date: this.date,
            typeName: '',
            accountCode: '',
            companyCode: '',
            currency: '',
            debit: 0,
            credit: 0,
            price: 0,
            qty: 0,
            amount: 0,
            subRowFlag: 'N',
            debitDisable: false,
            creditDisable: false,
            insertUser: this.$store.state.sessionId,
            insertUserName: this.$store.state.name,
            financePriceDetails: null
          });
        });
    },
    divisionRow(index, item) {
      var idx = this.items.indexOf(item);
      if (idx > -1) {
        this.items.splice(idx + 1, 0, {
          docNo: item.docNo,
          date: item.date,
          typeName: '',
          accountCode: '',
          companyCode: '',
          currency: '',
          debit: 0,
          credit: 0,
          price: 0,
          qty: 0,
          amount: 0,
          subRowFlag: 'Y',
          debitDisable: false,
          creditDisable: false,
          insertUser: this.$store.state.sessionId,
          insertUserName: this.$store.state.name,
          financePriceDetails: null
        });
      }
    },
    modalPopup(val, item) {
      this.selectedItem = item;
      this.setDialog.dialog = true;
      this.setDialog.type = val;
    },
    priceDetailModal(item) {
      this.selectedItem = item;
      if (item.currency == "") {
        alert("Please select Currency");
        return;
      }
      this.priceDetailDialog.dialog = true;
      this.priceDetailDialog.type = this.docType;
      this.priceDetailDialog.items = item;
    },
    closeDialog() {
      this.setDialog.dialog = false;
    },
    closePriceDetailModal() {
      this.priceDetailDialog.dialog = false;
    },
    transData(item) {
      this.selectedItem.accountCode = item;
      this.selectedItem.accountCode.subject = item.subject;
      this.selectedItem.currency = item.currency;
      this.setDialog.dialog = false;
      this.$forceUpdate();
    },
    setPriceItems(item, type) {
      if (type == "insert") {
        this.selectedItem.financePriceDetails = item;
      }else{
        this.getData(this.docNo);
      }

      if (type !== "delete") {
        this.priceDetailDialog.dialog = false;
      }
      this.$forceUpdate();
    },
    typeChange(item) {
      if (item.credit != "" && item.credit != "0") {
        item.debitDisable = true;
        item.type = "credit";
        item.typeName = "Credit";
      } else if (item.debit != "" && item.debit != "0") {
        item.creditDisable = true;
        item.type = "debit";
        item.typeName = "Debit";
      } else {
        item.creditDisable = false;
        item.debitDisable = false;
        item.type = "";
        item.typeName = "";
      }
    },
    getData(value) {
      var jsondata = JSON.stringify(value);
      axios.post('/api/v1/financeDetail/getItemDocNos', jsondata).then((response) => {
          console.warn(response);
          this.items = response.data;
        })
        .catch((ex) => {
          console.warn("ERROR!!!!! : ", ex)
        })
    },
    validation(items) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].typeName == "") {
          alert("Input Type");
          return true;
        } else if (items[i].accountCode.subject == "") {
          alert("Input AccountInfo");
          return true;
        } else if (items[i].companyCode == "") {
          alert("Select Company");
          return true;
        } else if (items[i].currency == "") {
          alert("Select Currency");
          return true;
        }
      }
    },
    financePriceDetailsSum(items) {
      var sum = 0;
      var amount = "";

      if (typeof items == "undefined" || items == null || items == "") {
        return sum;
      }
      for (var i = 0; i < items.length; i++) {
        amount = items[i].amount + "";
        sum += parseFloat(amount.replace(/,/g, ""));
      }
      return sum;
    }
  }
}
</script>

<style scoped>
.v-money {
  text-align: right;
}
.form-input.input-lg {
    font-size: 16px;
    height: 40px;
    padding: 0 12px;
    border: 0px solid #c4c9d3;
    width: 100%;
}
figure {
  text-align: center;
  padding-top: 10px;
}
figure img {
  width: 100%;
}
.input-group__input {
  width: 100%;
}
.input-group__input input {
  width: 100%;
}
</style>

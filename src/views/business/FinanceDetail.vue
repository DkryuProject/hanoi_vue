<template>
<v-card>
  <v-card-title>
    Finance Journal Entry
  </v-card-title>
  <v-card-title>
    <v-row>
      <v-col class="d-flex align-center pa-1" cols="6" sm="3">
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
      <v-col class="d-flex align-center pa-1" cols="12" sm="4">
        <v-btn @click="fileDownload()">Templet File</v-btn>
        <input type="file" @change="readFile" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" style=" height: 36px; font-size: 0.875rem;">
      </v-col>
      <v-col class="d-flex justify-end align-center pa-1" cols="12" sm="5">
        <v-btn @click="$router.push('/financeDetailRegister')">NEW</v-btn>
        <v-btn @click="modifyData()">MOD</v-btn>
        <v-btn @click="deleteData()">DEL</v-btn>
      </v-col>
    </v-row>
  </v-card-title>
  <v-divider></v-divider>
  <priceDetailDialog :setDialog="this.priceDetailDialog" @close="closePriceDetailModal"></priceDetailDialog>
  <v-data-table v-model="selectedData" height="600px" fixed-header :headers="headers" :items="financeitem" :items-per-page="10" :search="search" :footer-props="footerProps" :single-select="false" :options.sync="options"
    :server-items-length="totalItem" item-key="docNo" show-select>
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
import XLSX from 'xlsx'
import priceDetailDialog from '@/views/business/FinancePriceDetail'

export default {
  components: {
    priceDetailDialog
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
      selectedData: [],
      docType: '',
      docNo: [],
      headers: [],
      financeitem: [],
      priceDetailDialog: {
        dialog: false,
        items: null,
        type: null
      }
    }
  },
  created() {
    axios.get('/api/v1/screen/getHeaders?screenId=FINANCE').then((response) => {
      console.warn(response);
      this.headers = response.data
    });
  },
  computed: {
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

      let {
        sortBy,
        sortDesc,
        page,
        itemsPerPage
      } = this.options;
      console.log(sortBy, sortDesc, page, itemsPerPage);

      if (itemsPerPage == -1) {
        itemsPerPage = process.env.VUE_APP_MAX_PER_SIZE;
      }

      var dataObj = {};
      dataObj.insertUser = this.$store.state.sessionId;

      var pageObj = {};
      pageObj.pageNum = page - 1;
      pageObj.size = itemsPerPage;
      pageObj.sort = "docNo";

      var jsondata = {};
      jsondata.data = dataObj;
      jsondata.page = pageObj;
      jsondata.fromtoDate = this.dates;

      let loader = this.$loading.show({
        loader: 'dots'
      });
      axios.post('/api/v1/financeDetail/getItem', JSON.stringify(jsondata))
        .then((response) => {
          loader.hide();
          console.warn(response);
          this.financeitem = response.data.content;
          this.totalItem = response.data.totalElements;
        })
        .catch(error => {
          console.log(error);
        })
    },
    modifyData() {
      for (var i = 0; i < this.selectedData.length; i++) {
        if (this.selectedData[i].insertUser !== this.$store.state.sessionId) {
          alert("Can not modify.");
          return;
        }
        this.docNo.push(this.selectedData[i].docNo);
      }
      this.$router.push({
        name: 'financeDetailRegister',
        params: {
          docType: 'mod',
          docNo: this.docNo
        }
      })
    },
    deleteData() {
      for (var j = 0; j < this.selectedData.length; j++) {
        if (this.selectedData[j].insertUser !== this.$store.state.sessionId) {
          alert("Can not delete.");
          return;
        }
      }

      if (confirm('Are you deleted?')) {
        var docNos = [];
        for (var i = 0; i < this.selectedData.length; i++) {
          docNos.push(this.selectedData[i].docNo);
        }

        var jsondata = JSON.stringify(docNos);
        axios.post('/api/v1/financeDetail/deleteDocNos', jsondata).then((response) => {
            console.warn(response);
            alert("Deleted Success");
            this.financeitem = [];
            this.getitem();
          })
          .catch((ex) => {
            alert("ERROR!!!!! : ", ex)
          })
      }
    },
    readFile(event) {
      // get File object from input tag
      const file = event.currentTarget.files[0];
      var _this = this;
      var f = file;
      // declare FileReader, temp result
      const reader = new FileReader();
      FileReader.prototype.readAsBinaryString = function(f) {
        var binary = "";
        var wb; //Read completed data
        var outdata;
        var reader = new FileReader();

        reader.onload = function(e) {
          console.log(e);
          var bytes = new Uint8Array(reader.result);
          var length = bytes.byteLength;
          for (var i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          //If not introduced in main.js, you need to introduce it here to parse excel
          wb = XLSX.read(binary, {
            type: "binary"
          });

          outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
            raw: false
          });
          //outdata is read data (without header rows or headers, the header will be the subscript of the object)
          //Data can be processed here.
          let arr = [];
          outdata.map(v => {
            let obj = {}
            let acoountCode = {}
            let companyCode = {}
            acoountCode.accountCode = v['Account Code']
            companyCode.companyCode = v['Company Code']

            obj.date = v['Date']
            obj.type = v['TypeCode']
            obj.typeName = v['Type']
            obj.lineNum = parseFloat(v['Line No'])
            obj.accountCode = acoountCode
            obj.companyCode = companyCode
            obj.currency = v['Currency']
            obj.debit = parseFloat(v['Debit'].replace(/ /gi, ""))
            obj.credit = parseFloat(v['Credit'].replace(/ /gi, ""))
            obj.description = v['Description']
            obj.insertUser = v['Email']
            obj.insertUserName = v['Writer']
            arr.push(obj)
          });
          _this.uploadData(arr);
        };
        reader.readAsArrayBuffer(f);
      };
      reader.readAsBinaryString(f);
    },
    uploadData(uploadItems) {
      if (!this.uploadDataValiationCheck(uploadItems)) {
        var jsondata = JSON.stringify(uploadItems);
        axios.post('/api/v1/financeDetail/fileUpload', jsondata).then((response) => {
            console.warn(response);
            alert("File Upload Success");
            this.financeitem = [];
            this.getitem();
          })
          .catch((ex) => {
            alert("ERROR!!!!! : ", ex)
          })
      }
    },
    uploadDataValiationCheck(uploadItems) {
      for (var i = 0; i < uploadItems.length; i++) {
        var line = i + 1;
        if (typeof uploadItems[i].date == "undefined" || uploadItems[i].date == null || uploadItems[i].date == "") {
          alert("[Row : " + line + "] Date input Please!!!");
          return true;
        } else if (typeof uploadItems[i].type == "undefined" || uploadItems[i].type == null || uploadItems[i].type == "") {
          alert("[Row : " + line + "] Type select Please!!!");
          return true;
        } else if (typeof uploadItems[i].lineNum == "undefined" || uploadItems[i].lineNum == null || uploadItems[i].lineNum == "") {
          alert("[Row : " + line + "] Line No input Please!!!");
          return true;
        } else if (typeof uploadItems[i].accountCode == "undefined" || uploadItems[i].accountCode == null || uploadItems[i].accountCode == "") {
          alert("[Row : " + line + "] Account select Please!!!");
          return true;
        } else if (typeof uploadItems[i].companyCode == "undefined" || uploadItems[i].companyCode == null || uploadItems[i].companyCode == "") {
          alert("[Row : " + line + "] Company select Please!!!");
          return true;
        } else if (typeof uploadItems[i].currency == "undefined" || uploadItems[i].currency == null || uploadItems[i].currency == "") {
          alert("[Row : " + line + "] Currency input Please!!!");
          return true;
        } else if (typeof uploadItems[i].insertUser == "undefined" || uploadItems[i].insertUser == null || uploadItems[i].insertUser == "") {
          alert("[Row : " + line + "] Email input Please!!!");
          return true;
        } else if (typeof uploadItems[i].insertUserName == "undefined" || uploadItems[i].insertUserName == null || uploadItems[i].insertUserName == "") {
          alert("[Row : " + line + "] Writer input Please!!!");
          return true;
        }
      }
    },
    fileDownload() {
      axios({
        url: '/api/v1/file/download',
        method: 'POST',
        data: {
          type: 'detail'
        },
        responseType: 'blob',
      }).then((response) => {
        var fileURL = window.URL.createObjectURL(new Blob([response.data]));
        var fileLink = document.createElement('a');

        fileLink.href = fileURL;
        fileLink.setAttribute('download', 'sampleFinance.xlsx');
        document.body.appendChild(fileLink);

        fileLink.click();
      });
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

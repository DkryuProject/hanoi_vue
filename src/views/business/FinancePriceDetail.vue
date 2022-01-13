<template>
<v-layout row justify-center>
  <v-dialog v-model="financePriceDetailModal" persistent width="1500px" @keydown.esc="closeModal()">
    <v-card height="800px">
      <v-toolbar dark color="primary">
        <v-toolbar-title> Item Cost Detail
          <span v-if="this.setDialog.type == 'mod'">Modify</span>
          <span v-else-if="this.setDialog.type == 'view'"></span>
          <span v-else>Register</span>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click.stop="closeModal()">X</v-btn>
      </v-toolbar>
      <v-card-title>
        <v-row v-if="this.setDialog.type !== 'view'">
          <v-col class="d-flex align-center pa-1" cols="12" sm="4">
            <v-btn @click="fileDownload()">Templet File</v-btn>
            <input type="file" @change="readFile" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" style=" height: 36px; font-size: 0.875rem;">
          </v-col>
          <v-spacer></v-spacer>
          <v-col class="d-flex justify-end align-center pa-1" cols="12" sm="5">
            <v-btn @click="addNewRow">Add Row</v-btn>
            <v-btn @click="saveItem">SAVE</v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table height="600px" fixed-header :headers="headers" :items="items" hide-default-footer :items-per-page="1000">
        <template v-if="this.setDialog.type !== 'view'" v-slot:item="{item, index}">
          <tr>
            <input type="hidden" v-model="item.insertUser" />
            <input type="hidden" v-model="item.id" />
            <td class="pa-0">
              <v-icon @click="deleteRow(index, item)">mdi-trash-can</v-icon>
            </td>
            <td class="pa-0">
              <v-autocomplete v-model="item.subCategory" :items="subCategorys" item-text="codeName" item-value="code" return-object persistent-hint single-line solo dense hide-details></v-autocomplete>
            </td>
            <td class="pa-0">
              <v-text-field v-model="item.supplier" solo dense hide-details></v-text-field>
            </td>
            <td class="pa-0">
              <v-text-field v-model="item.currency" solo dense readonly hide-details></v-text-field>
            </td>
            <td class="pa-0">
              <v-text-field v-model="item.unitMeasurement" solo dense hide-details></v-text-field>
            </td>
            <td class="pa-0">
              <v-card>
                <money v-model="item.amount" v-bind="money" class="form-input input-lg"></money>
              </v-card>
            </td>
            <td class="pa-0">
              <v-card>
                <money v-model="item.quantity" v-bind="money" class="form-input input-lg"></money>
              </v-card>
            </td>
            <td class="text-right grey lighten-2">
              {{calculateLineTotal(item) | currency}}
            </td>
          </tr>
        </template>
        <template v-else v-slot:item="{item}">
          <tr>
            <input type="hidden" v-model="item.insertUser" />
            <td class="text-center">
              {{item.subCategoryName}}
            </td>
            <td class="text-center">
              {{item.supplier}}
            </td>
            <td class="text-center">
              {{item.currency}}
            </td>
            <td class="text-center">
              {{item.unitMeasurement}}
            </td>
            <td class="text-right">
              {{item.amount | currency}}
            </td>
            <td class="text-right">
              {{getExchange(item.amount) | currency}}
            </td>
            <td class="text-right">
              {{item.quantity | currency}}
            </td>
            <td class="text-right grey lighten-2">
              {{calculateLineTotal(item) | currency}}
            </td>
            <td class="text-right grey lighten-2">
              {{getExchange(calculateLineTotal(item)) | currency}}
            </td>
          </tr>
        </template>
        <template v-if="this.setDialog.type !== 'view' && this.items.length !== 0" v-slot:body.append="{ items }">
          <v-divider></v-divider>
          <tr class="grey lighten-2">
            <td :colspan="colspan" class="text-center font-weight-bold subtitle-2">Total:</td>
            <td :colspan="5"></td>
            <td class="text-right font-weight-bold subtitle-2">{{summarySum('amount',items) | currency}}</td>
          </tr>
        </template>
        <template v-else v-slot:body.append="{ items }">
          <v-divider></v-divider>
        </template>
      </v-data-table>
    </v-card>
  </v-dialog>
</v-layout>
</template>

<script>
import axios from 'axios'
import XLSX from 'xlsx'

export default {
  props: {
    setDialog: {
      type: Object
    }
  },
  data() {
    return {
      headers: [],
      items: [],
      subCategorys: [],
      exchageData: [],
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
    this.getExchageData();
    this.getCodes('itemSubCategory');
  },
  computed: {
    financePriceDetailModal() {
      return this.setDialog.dialog;
    },
    colspan() {
      if (this.setDialog.type !== "view") {
        return "2";
      } else {
        return "1";
      }
    }
  },
  watch: {
    financePriceDetailModal: {
      handler: function(value) {
        if (value) {
          this.items = [];
          let screenId = "PRICE";
          if (this.setDialog.type !== "view") {
            screenId = "PRICE";
          }else{
            screenId = "PRICEVIEW";
          }
          axios.get('/api/v1/screen/getHeaders?screenId='+screenId).then((response) => {
            console.warn(response);
            this.headers = response.data;

            if (this.setDialog.type !== "view") {
              var obj = new Object();
              obj.text = " ";
              obj.width = "10px";
              obj.fixed = true;

              this.headers.splice(0, 0, obj);
            }
          });

          if (this.setDialog.items.financePriceDetails.length !== 0) {
            this.items = this.setDialog.items.financePriceDetails;
          }
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
        this.subCategorys = response.data
      })
    },
    addNewRow() {
      var vModel = new Object();

      for (var j = 0; j < this.headers.length; j++) {
        if (this.headers[j].value == "quantity" || this.headers[j].value == "amount" || this.headers[j].value == "price") {
          vModel[this.headers[j].value] = "0";
        } else if (this.headers[j].value == "currency") {
          vModel[this.headers[j].value] = this.setDialog.items.currency;
        } else {
          vModel[this.headers[j].value] = "";
        }
      }
      vModel["insertUser"] = this.$store.state.sessionId;
      vModel["id"] = "";
      this.items.push(vModel);
    },
    deleteRow(index, item) {
      console.log(item);
      if (this.setDialog.type == "mod" && item.id !== "") {
        if (confirm('Are you deleted?')) {
          axios.post("/api/v1/financeDetail/financePriceDetailDelete", JSON.stringify(item)).then(response => {
              console.warn(response)
              this.items = response.data;
              alert("Delete Success");
              this.$emit('setPriceItems', this.items, "delete");
            })
            .catch((ex) => {
              console.warn("ERROR!!!!! : ", ex)
              alert("ERROR!!!!! : ", ex)
            })
        }
      }
      var idx = this.items.indexOf(item);
      if (idx > -1) {
        this.items.splice(idx, 1);
      }
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
    summarySum(type, items) {
      var sum = 0;
      var amount = "";
      for (var i = 0; i < items.length; i++) {
        if (type == "amount") {
          amount = items[i].amount + "";
          sum += parseFloat(amount.replace(/,/g, ""));
        }
      }
      return sum;
    },
    closeModal() {
      this.$emit('close');
    },
    saveItem() {
      var obj = new Object();

      if (this.setDialog.type == "mod") {
        if (confirm('Are you modify?')) {
          obj.docNo = this.setDialog.items.docNo;
          obj.lineNum = this.setDialog.items.lineNum;
          obj.financePriceDetails = this.items;

          axios.post("/api/v1/financeDetail/financePriceDetailUpdate", JSON.stringify(obj)).then(response => {
              console.warn(response)
              this.items = response.data;
              alert("Modify Success");
              this.$emit('setPriceItems', this.items, "update");
            })
            .catch((ex) => {
              console.warn("ERROR!!!!! : ", ex)
              alert("ERROR!!!!! : ", ex)
            })
        }
      } else {
        obj.financePriceDetails = this.items;
        this.$emit('setPriceItems', obj.financePriceDetails, "insert");
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
            let subCategory = {}
            subCategory.code = v['Sub Category Code']
            subCategory.codeName = v['Sub Category']

            obj.subCategory = subCategory
            obj.supplier = v['Item Name']
            obj.unitMeasurement = v['Unit Measurement']
            obj.quantity = parseFloat(v['Quantity'].replace(/ /gi, ""))
            obj.amount = parseFloat(v['Amount'].replace(/ /gi, ""))
            obj.insertUser = _this.$store.state.sessionId
            obj.currency = _this.setDialog.items.currency
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
        this.items = uploadItems;
      }
    },
    uploadDataValiationCheck(uploadItems) {
      for (var i = 0; i < uploadItems.length; i++) {
        var line = i + 1;
        if (typeof uploadItems[i].subCategory == "undefined" || uploadItems[i].subCategory == null || uploadItems[i].subCategory == "") {
          alert("[Row : " + line + "] Sub Category Code input Please!!!");
          return true;
        } else if (typeof uploadItems[i].supplier == "undefined" || uploadItems[i].supplier == null || uploadItems[i].supplier == "") {
          alert("[Row : " + line + "] Supplier input Please!!!");
          return true;
        } else if (typeof uploadItems[i].unitMeasurement == "undefined" || uploadItems[i].unitMeasurement == null || uploadItems[i].unitMeasurement == "") {
          alert("[Row : " + line + "] Unit Measurement input Please!!!");
          return true;
        } else if (typeof uploadItems[i].quantity == "undefined" || uploadItems[i].quantity == null || uploadItems[i].quantity == "") {
          alert("[Row : " + line + "] Quantity input Please!!!");
          return true;
        } else if (typeof uploadItems[i].amount == "undefined" || uploadItems[i].amount == null || uploadItems[i].amount == "") {
          alert("[Row : " + line + "] Amount input Please!!!");
          return true;
        }
      }
    },
    fileDownload() {
      axios({
        url: '/api/v1/file/download',
        method: 'POST',
        data: {
          type: 'price'
        },
        responseType: 'blob',
      }).then((response) => {
        var fileURL = window.URL.createObjectURL(new Blob([response.data]));
        var fileLink = document.createElement('a');

        fileLink.href = fileURL;
        fileLink.setAttribute('download', 'sampleFinancePrice.xlsx');
        document.body.appendChild(fileLink);

        fileLink.click();
      });
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

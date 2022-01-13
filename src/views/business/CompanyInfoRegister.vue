<template>
<v-card>
  <v-card-title>
    Company Info
    <div style="position:relative;left:10px;">
      <span v-if="docType != 'mod'">Register</span>
      <span v-else>Modify</span>
    </div>
    <v-spacer></v-spacer>
    <div>
      <v-btn v-show="docType != 'mod'" @click="addNewRow">Add Row</v-btn>
      <v-btn @click="saveItem">SAVE</v-btn>
    </div>
  </v-card-title>
  <v-divider></v-divider>
  <v-data-table height="600px" fixed-header :headers="headers" :items="items" hide-default-footer :items-per-page="1000">
    <template v-slot:item="{item}">
      <tr class="pa-0">
        <td>
          <v-text-field v-model="item.companyCode" solo dense hide-details></v-text-field>
        </td>
        <td>
          <input type="hidden" v-model="item.idx" />
          <input type="hidden" v-model="item.insertUser" />
          <v-text-field v-model="item.companyName" solo dense hide-details></v-text-field>
        </td>
        <td>
          <v-autocomplete v-model="item.companyType" :items="company_types" item-text="codeName" item-value="code" persistent-hint single-line solo dense hide-details></v-autocomplete>
        </td>
        <td>
          <v-text-field v-model="item.description" solo dense hide-details></v-text-field>
        </td>
        <td>
          <v-text-field v-model="item.address" solo dense hide-details></v-text-field>
        </td>
        <td>
          <div v-show="docType != 'mod'">
            <v-icon @click="deleteRow(k, item)">mdi-trash-can</v-icon>
          </div>
        </td>
      </tr>
    </template>
  </v-data-table>
</v-card>
</template>

<script>
import axios from 'axios'

export default {
  data: function() {
    return {
      type: null,
      docType: '',
      headers: [],
      detailItem: [],
      items: [],
      company_types: []
    }
  },
  created() {
    this.getCodes('companyType');
    this.docType = this.$route.params.docType;
    this.detailItem = this.$route.params.detailItem;

    axios.get('/api/v1/screen/getHeaders?screenId=COMPANY').then((response) => {
      console.warn(response);
      this.headers = response.data;
    });
  },
  watch: {
    docType: {
      handler: function() {
        if (this.docType == "mod") {
          for (var i = 0; i < this.detailItem.length; i++) {
            this.items.push(this.detailItem[i]);
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
        console.warn(response);
        this.company_types = response.data
      })
    },
    addNewRow() {
      var vModel = new Object();

      for (var j = 0; j < this.headers.length; j++) {
        vModel[this.headers[j].value] = "";
      }
      vModel["insertUser"] = this.$store.state.sessionId;
      this.items.push(vModel);
    },
    deleteRow(index, company_item) {
      if (this.docType == "mod") {
        console.log("delete row mod");

        if (confirm('Are you deleted?')) {
          var jsondata = JSON.stringify(company_item);
          axios.post('/api/v1/company/delete', jsondata).then((response) => {
              console.warn(response);
              alert("Deleted Success");
            })
            .catch((ex) => {
              alert("ERROR!!!!! : ", ex)
            })
        }
      }

      var idx = this.items.indexOf(company_item);

      if (idx > -1) {
        this.items.splice(idx, 1);
      }
    },
    saveItem() {
      console.log(JSON.stringify(this.items));

      var url = "";
      if (this.docType == "mod") {
        url = "/api/v1/company/update";
      } else {
        url = "/api/v1/company/insert";
      }
      axios.post(process.env.VUE_APP_BACKEND_URL + url, JSON.stringify(this.items)).then(response => {
        console.warn(response)
        this.result = response.data
        this.no = response.data.no
        this.$router.go(-1)
      }).catch((ex) => {
        console.warn("ERROR!!!!! : ", ex)
      })
    },
  }
}
</script>

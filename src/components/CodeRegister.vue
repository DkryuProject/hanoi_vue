<template>
<v-layout row justify-center>
  <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition" :value="dialog">
    <v-card>
      <v-toolbar dark color="primary">
        <v-toolbar-title> Info Registry ({{getType}})</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="addNewRow()">
          ADD
        </v-btn>
        <v-btn icon dark @click="saveCode()">
          SAVE
        </v-btn>
        <v-btn icon dark @click="closeModal()">
          CLOSE
        </v-btn>
      </v-toolbar>
      <v-divider></v-divider>
      <table>
        <thead>
          <tr>
            <th scope="col" width="1%"></th>
            <th scope="col" width="5%">Code</th>
            <th scope="col" width="5%">Code Name</th>
            <th scope="col" width="5%">Seq</th>
            <th scope="col" width="20%">Text1</th>
            <th scope="col" width="20%">Text2</th>
            <th scope="col" width="20%">Text3</th>
            <th scope="col" width="20%">Text4</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(infoitem, k) in infoitems" :key="k">
            <td scope="row" class="trashIconContainer">
              <v-icon @click="deleteRow(k, infoitem)">mdi-trash-can</v-icon>
            </td>
            <td>
              <input type="hidden" v-model="infoitem.type" />
              <v-text-field v-model="infoitem.code" solo dense hide-details></v-text-field>
            </td>
            <td>
              <v-text-field v-model="infoitem.codeName" solo dense hide-details></v-text-field>
            </td>
            <td>
              <v-text-field v-model="infoitem.seq" solo dense hide-details></v-text-field>
            </td>
            <td>
              <v-text-field v-model="infoitem.text1" solo dense hide-details></v-text-field>
            </td>
            <td>
              <v-text-field v-model="infoitem.text2" solo dense hide-details></v-text-field>
            </td>
            <td>
              <v-text-field v-model="infoitem.text3" solo dense hide-details></v-text-field>
            </td>
            <td>
              <v-text-field v-model="infoitem.text4" solo dense hide-details></v-text-field>
            </td>
          </tr>
        </tbody>
      </table>
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
      type: null,
      infoitems: []
    }
  },
  computed: {
    dialog() {
      return this.setDialog.dialog
    },
    getType() {
      return this.setDialog.type
    }
  },
  watch: {
    getType: {
      handler: function(value) {
        this.type = value;
        this.infoitems.push({
          type: this.type,
          code: '',
          codeName: '',
          seq: '',
          text1: '',
          text2: '',
          text3: '',
          text4: ''
        })
      }
    }
  },
  methods: {
    saveCode() {
      axios.post(process.env.VUE_APP_BACKEND_URL + '/api/v1/code/insert',
        JSON.stringify(this.infoitems), {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, PUT, OPTIONS, DELETE',
            'Access-Control-Allow-Headers': 'Access-Control-Allow-Methods, Access-Control-Allow-Origin, Origin, Accept, Content-Type',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      ).then(response => {
        this.result = response.data;
        this.no = response.data.no;
        this.reset();
        this.$emit('close');
      }).catch((ex) => {
        console.warn("ERROR!!!!! : ", ex)
      })
    },
    closeModal() {
      this.reset();
      this.$emit('close');
    },
    deleteRow(index, infoitem) {
      var idx = this.infoitems.indexOf(infoitem);
      if (idx > -1) {
        this.infoitems.splice(idx, 1);
      }
    },
    addNewRow() {
      this.infoitems.push({
        type: this.type,
        code: '',
        codeName: '',
        seq: '',
        text1: '',
        text2: '',
        text3: '',
        text4: ''
      });
    },
    reset() {
      Object.assign(this.$data, this.$options.data());
    }
  }
}
</script>

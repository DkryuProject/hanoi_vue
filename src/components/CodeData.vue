<template>
<v-card>
  <v-card-title>
    <v-spacer></v-spacer>
    <div>
      <v-btn @click="openDialog()">NEW</v-btn>
      <set-dialog :setDialog="this.setDialog" @close="closeDialog"></set-dialog>
    </div>
  </v-card-title>
  <v-data-table :headers="headers" :items="financeitem" :items-per-page="10" :search="search">
  </v-data-table>
</v-card>
</template>

<script>
import axios from 'axios'
import setDialog from '@/components/CodeRegister'

export default {
  components: {
    setDialog
  },
  data() {
    return {
      search: '',
      setDialog: {
        dialog: false,
        type: null
      },
      codetype: null,
      headers: [{
          text: 'Code',
          value: 'code'
        },
        {
          text: 'Code Name',
          value: 'codeName'
        },
        {
          text: 'Seq',
          value: 'seq'
        },
        {
          text: 'Text1',
          value: 'text1'
        },
        {
          text: 'Text2',
          value: 'text2'
        },
        {
          text: 'Text3',
          value: 'text3'
        },
        {
          text: 'Text4',
          value: 'text4'
        }
      ],
      financeitem: []
    }
  },
  created() {
    // 뷰가 생성되고 데이터가 이미 감시 되고 있을 때 데이터를 가져온다.
    this.codetype = this.$route.params.codetype;
    this.getitem();
  },
  watch: {
    // 라우트가 변경되면 메소드를 다시 호출됩니다.
    '$route': {
      handler() {
        this.codetype = this.$route.params.codetype;
        this.getitem();
      }
    }
  },
  methods: {
    getitem() {
      var jsondata = JSON.stringify({
        type: this.codetype
      });
      console.log(jsondata);
      axios.post('/api/v1/code/getItem', jsondata).then((response) => {
        console.warn(response);
        this.financeitem = response.data
      })
    },
    openDialog() {
      this.setDialog.dialog = true
      this.setDialog.type = this.codetype
    },
    closeDialog() {
      this.setDialog.dialog = false;
      this.getitem();
    }
  }
}
</script>

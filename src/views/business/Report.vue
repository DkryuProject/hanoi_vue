<template>
<v-card>
  <v-card-title>Report</v-card-title>
  <v-card-title>
    <div>
      <v-btn @click="getReport('A')">Balance Sheet</v-btn>
      <v-btn @click="getReport('B')">Income Statement</v-btn>
    </div>
    <v-spacer></v-spacer>
    <div>
      <v-btn @click="$refs.myPdfComponent.print()">print</v-btn>
      <!--input v-model.number="page" type="number" style="width: 5em"> /{{numPages}}
      <button @click="rotate += 90">&#x27F3;</button>
      <button @click="rotate -= 90">&#x27F2;</button-->
    </div>
  </v-card-title>
  <v-divider></v-divider>
  <v-content v-show="loading == true" class="pa-0">
    <v-row>
      <v-col class="text-center" height="600px">
        <pdf ref="myPdfComponent" :src="pdfURL" :page="page" :rotate="rotate" @progress="loadedRatio = $event" @error="error" @num-pages="numPages = $event" @link-clicked="page = $event" style="border: 1px solid; display: inline-block; width: 50%">
        </pdf>
      </v-col>
    </v-row>
  </v-content>
</v-card>
</template>

<script>
import axios from 'axios'
import pdf from 'vue-pdf'

export default {
  components: {
    pdf
  },
  data() {
    return {
      loading: false,
      loadedRatio: 0,
      page: 1,
      numPages: 0,
      rotate: 0,
      pdfURL: null
    }
  },
  created() {
    this.getReport('A');
  },
  methods: {
    getReport(type) {
      let loader = this.$loading.show({
        loader: 'dots'
      });

      axios({
        url: '/api/v1/report/finaceReport?type='+type,
        method: 'GET',
        responseType: 'blob',
      }).then((response) => {
        console.log(response.data);
        this.pdfURL = window.URL.createObjectURL(new Blob([response.data], {
          type: 'application/pdf'
        }));
        loader.hide();
        this.loading =true;
        console.log(this.pdfURL);
        //window.open(fileURL);
        //let blob = new Blob([response.data], {type: 'application/pdf'});
        //this.contract.data = 'data:application/pdf;base64,' + btoa(blob);
        //this.loading = false;
      });
    },
    error: function(err) {
      console.log(err);
    }
  }
}
</script>

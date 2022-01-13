<template>
  <v-card>
    <v-card-title>월별 현황</v-card-title>
    <GChart type="ColumnChart" :data="chartData" :options="chartOptions" />
  </v-card>
</template>

<script>
import { GChart } from "vue-google-charts";

export default {
  components: {
    GChart
  },
  data() {
    return {
      // Array will be automatically processed with visualization.arrayToDataTable function
      chartData: [
        ["Month", "credit", "debit"],
        ["2019/1", 815762924064, 815784043596],
        ["2020/1", 573457409331, 573557434715],
        ["2020/2", 243475318997, 243475319028],
        ["2020/3", 175213952933, 175213952894]
      ],
      chartOptions: {
        chart: {
          title: "Company Performance",
          subtitle: "Sales, Expenses, and Profit: 2014-2017"
        }
      }
    };
  }
};
</script>

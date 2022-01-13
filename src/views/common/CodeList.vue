<template>
<div>
  <v-tabs v-model="activeTab">
    <v-tab v-for="tab of tabs" :key="tab.id" :to="tab.route" exact>
      {{ tab.name }}
    </v-tab>
  </v-tabs>
  <vCodeData></vCodeData>
</div>
</template>

<script>
import vCodeData from '@/components/CodeData'

export default {
  components: {
    vCodeData
  },
  created() {
    this.codetype = this.$route.params.codetype;
  },
  data() {
    return {
      codetype: null,
      activeTab: null,
      tabs: [{
          id: 1,
          name: "Type",
          value: "type",
          route: "/codeInfo/type"
        },
        {
          id: 2,
          name: "Currency",
          value: "currency",
          route: "/codeInfo/currency"
        },
        {
          id: 3,
          name: "Company Type",
          value: "companyType",
          route: "/codeInfo/companyType"
        },
        {
          id: 4,
          name: "Item Sub Category",
          value: "itemSubCategory",
          route: "/codeInfo/itemSubCategory"
        }
      ]
    }
  }
}
</script>

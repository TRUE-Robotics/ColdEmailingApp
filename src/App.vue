<!-- src/App.vue -->

<template>
  <div id="app">
    <ExcelFileFetcher @dataFetched="handleDataFetched" />
    <SmartleadCampaign
      v-if="excelData && excelData.length"
      :campaignData="excelData"
    />
  </div>
</template>

<script>
import { ref } from "vue";
import ExcelFileFetcher from "./components/ExcelFileFetcher.vue";
import SmartleadCampaign from "./components/SmartleadCampaign.vue";

export default {
  name: "App",
  components: {
    ExcelFileFetcher,
    SmartleadCampaign,
  },
  setup() {
    const excelData = ref(null);

    const handleDataFetched = (data) => {
      excelData.value = data;
    };

    return {
      excelData,
      handleDataFetched,
    };
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>

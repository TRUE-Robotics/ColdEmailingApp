<!-- src/App.vue -->

<template>
  <v-app>
    <v-main>
      <!-- Fetch Excel File -->
      <ExcelFileFetcher @dataFetched="handleDataFetched" />

      <!-- Show Smartlead Campaign component if data is available -->
      <SpreadsheetDisplay
        v-if="campaignId"
        :campaignId="campaignId"
        :spreadsheetData="excelData"
      />
      <SmartleadCampaign
        v-if="excelData && excelData.length"
        :campaignData="excelData"
        @campaignCreated="handleCampaignCreated"
      />

      <!-- Show the Spreadsheet Display Component -->
    </v-main>
  </v-app>
</template>

<script>
import { ref } from "vue";
import ExcelFileFetcher from "./components/ExcelFileFetcher.vue";
import SmartleadCampaign from "./components/SmartleadCampaign.vue";
import SpreadsheetDisplay from "./components/SpreadsheetDisplay.vue";

export default {
  name: "App",
  components: {
    ExcelFileFetcher,
    SmartleadCampaign,
    SpreadsheetDisplay,
  },
  setup() {
    const excelData = ref(null);
    const campaignId = ref(null);

    const handleDataFetched = (data) => {
      excelData.value = data;
    };

    const handleCampaignCreated = (id) => {
      campaignId.value = id;
    };

    return {
      excelData,
      handleDataFetched,
      campaignId,
      handleCampaignCreated,
    };
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>

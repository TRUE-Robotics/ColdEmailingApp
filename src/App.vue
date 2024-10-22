<template>
  <v-app>
    <!-- Navigation or Header Component (optional) -->
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Smartlead Campaign Manager</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <!-- Fetch Excel File -->
      <ExcelFileFetcher @dataFetched="handleDataFetched" />

      <!-- Show the Spreadsheet Display Component if data is available -->
      <SpreadsheetDisplay v-if="excelData" :spreadsheetData="excelData" />

      <SmartleadCampaign
        v-if="excelData"
        :campaignData="excelData"
        @campaignCreated="handleCampaignCreated"
      />
    </v-main>

    <!-- Footer (optional) -->
    <v-footer app>
      <v-col class="text-center">
        &copy; 2024 True Robotics - All Rights Reserved
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
import { ref } from "vue";
import ExcelFileFetcher from "./components/ExcelFileFetcher.vue";
import SmartleadCampaign from "./views/SmartleadCampaign.vue";
import SpreadsheetDisplay from "./views/SpreadsheetDisplay.vue";

export default {
  name: "App",
  components: {
    ExcelFileFetcher,
    SmartleadCampaign,
    SpreadsheetDisplay,
  },
  setup() {
    const excelData = ref(null);

    const handleDataFetched = (data) => {
      excelData.value = data; // Update excelData with new fetched data
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

<template>
  <v-container class="spreadsheet-container">

    <!-- Display log message for errors or information -->
    <v-row>
      <v-alert v-if="logMessage" type="info">
        {{ logMessage }}
      </v-alert>
    </v-row>

    <!-- Display log message for errors or information -->
    <v-row justify="space-between">
      <v-col>
        <h2>Spreadsheet Data</h2>
      </v-col>
      <v-col>
        <SpreadsheetControls
        @pauseSchool="pauseSchool"
        @resumeSchool="resumeSchool"
        />
      </v-col>
    </v-row>

    <!-- Row of autocomplete inputs for filtering the first five columns -->
    <v-row>
      <v-col
        v-for="header in headers.slice(0, 5)"
        :key="header"
        cols="auto"
        class="filter-input"
      >
        <v-autocomplete
          v-model="columnFilters[header]"
          :items="columnUniqueValues[header]"
          :label="header"
          placeholder="Filter"
          dense
          hide-details
          clearable
          allow-overflow
        ></v-autocomplete>
      </v-col>
    </v-row>

    <!-- Display data in a table format -->
    <v-data-table
      :headers="tableHeaders"
      :items="filteredData"
      :items-per-page="100"
      dense
    >
    </v-data-table>
  </v-container>
</template>

<script>
import SpreadsheetControls from "@/components/SpreadsheetControls.vue";
import { ref, computed, onMounted, watch } from "vue";
import {
  listAllLeads,
  pauseLead,
  resumeLead,
} from "@/utils/smartleadService";

export default {
  name: "SpreadsheetDisplay",
  props: {
    spreadsheetData: {
      type: Array,
      default: () => [],
      required: true,
    },
    campaignId: {
      type: Number
    }
  },
  components: {
    SpreadsheetControls
  },
  methods: {

    // Pause a school
    async pauseSchool() {
      this.logMessage = null;
      try {

        if (!this.campaignId) {
          this.logMessage = "Please select a campaign.";
          return;
        }

        if (!this.selectedSchool) {
          this.logMessage = "Please select a school.";
          return;
        }

        const leadData = await listAllLeads(this.campaignId);
        const filteredLeads = leadData.data.filter((lead) => lead.lead.company_name === this.selectedSchool);

        for (const lead of filteredLeads) {
          await pauseLead(this.campaignId, lead.lead.id);
        }

      } catch (error) {
        this.logMessage = "Error Pausing School.";
        console.error(error);
      }
    },

    // Resume a school
    async resumeSchool() {

      this.logMessage = null;
      try {

        if (!this.campaignId) {
          this.logMessage = "Please select a campaign.";
          return;
        }

        console.log(this.selectedSchool)
        if (!this.selectedSchool) {
          this.logMessage = "Please select a school.";
          return;
        }

        const leadData = await listAllLeads(this.campaignId);
        const filteredLeads = leadData.data.filter((lead) => lead.lead.company_name === this.selectedSchool);

        for (const lead of filteredLeads) {
          await resumeLead(this.campaignId, lead.lead.id);
        }

      } catch (error) {
        this.logMessage = "Error Resuming School.";
        console.error(error);
      }
    },

  },
  setup(props) {
    const tableData = ref([]);
    const headers = ref([]);
    const logMessage = ref("");
    const selectedSchool = ref(null);
    const selectedPriority = ref(null);

    // Column filters for the first five headers
    const columnFilters = ref({});

    // Unique values for autocomplete options
    const columnUniqueValues = ref({});

    // Initialize data on component mount
    onMounted(() => {
      if (props.spreadsheetData && props.spreadsheetData.length > 0) {
        tableData.value = props.spreadsheetData;

        headers.value = Object.keys(props.spreadsheetData[0]);

        // Initialize columnFilters and columnUniqueValues for the first five headers
        headers.value.slice(0, 5).forEach((header) => {
          columnFilters.value[header] = "";
          columnUniqueValues.value[header] = getUniqueValues(header);
        });
      } else {
        logMessage.value = "No data available in the spreadsheet.";
      }
    });

    // Watch for changes in spreadsheet
    watch(
      () => props.spreadsheetData,
      (newData) => {
        if (newData && newData.length > 0) {
          tableData.value = newData;
        } else {
          logMessage.value = "No data available in the spreadsheet.";
        }
      },
      {immediate: true }
    )

    // Function to get unique values for a given column
    const getUniqueValues = (header) => {
      const values = tableData.value.map((item) => item[header]);
      return [...new Set(values)].filter((v) => v !== undefined && v !== null);
    };

    // Computed property for filtered data
    const filteredData = computed(() => {
      let data = tableData.value;

      // Apply column filters for the first five headers
      data = data.filter((item) => {
        return headers.value.slice(0, 5).every((header) => {
          const filterValue = columnFilters.value[header];
          if (!filterValue) return true;
          if (header === 'School') selectedSchool.value = filterValue;
          if (header === 'Priority') selectedPriority.value = filterValue;
          const cellValue = String(item[header]).toLowerCase();
          return cellValue.includes(String(filterValue).toLowerCase());
        });
      });

      return data;
    });

    // Prepare headers for v-data-table
    const tableHeaders = computed(() => {
      return headers.value.map((header) => ({
        key: header,
        title: header,
      }));
    });

    return {
      filteredData,
      tableHeaders,
      logMessage,
      selectedSchool,
      selectedPriority,
      headers,
      columnFilters,
      columnUniqueValues,
    };
  },
};
</script>

<style scoped>
.spreadsheet-container {
  margin: 20px;
  width: 95%;
  max-width: 95%;
  overflow-x: auto;
}

.v-row {
  margin-bottom: 10px;
}

.filter-input {
  width: 20%;
  padding-right: 10px;
}

.v-data-table {
  margin-top: 10px;
}
</style>

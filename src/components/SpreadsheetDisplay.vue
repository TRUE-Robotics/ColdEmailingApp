<template>
  <v-container class="spreadsheet-container">
    <h2>Spreadsheet Data</h2>

    <!-- Display log message for errors or information -->
    <v-alert v-if="logMessage" type="info">
      {{ logMessage }}
    </v-alert>

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
import { ref, computed, onMounted } from "vue";

export default {
  name: "SpreadsheetDisplay",
  props: {
    spreadsheetData: {
      type: Array,
      default: () => [],
      required: true,
    },
  },
  setup(props) {
    const tableData = ref([]);
    const headers = ref([]);
    const logMessage = ref("");

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

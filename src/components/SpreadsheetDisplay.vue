<template>
  <v-container class="spreadsheet-container">
    <v-row>
      <v-col>
        <h2>Spreadsheet Data</h2>

        <!-- Display log message for errors or information -->
        <v-alert v-if="logMessage" type="info">
          {{ logMessage }}
        </v-alert>

        <!-- Controls for filtering and sorting -->
        <v-card outlined class="pa-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="filterColumn"
                label="Filter by Column"
                placeholder="Enter column (e.g., 'State')"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="filterValue"
                label="Value"
                placeholder="Enter value (e.g., 'MA')"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-btn color="primary" @click="applyFilter"> Apply Filter </v-btn>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="sortColumn"
                label="Sort by Column"
                placeholder="Enter column (e.g., 'Priority')"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-btn color="primary" @click="applySort(true)">
                Sort Ascending
              </v-btn>
              <v-btn color="primary" @click="applySort(false)">
                Sort Descending
              </v-btn>
            </v-col>
          </v-row>
        </v-card>

        <!-- Display data in a table format -->
        <v-data-table
          v-if="tableData.length > 0"
          :items="tableData"
          class="mt-4"
          dense
        >
          <template v-slot:item="{ item }">
            <tr>
              <td v-for="(value, index) in item" :key="index">{{ value }}</td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, watch } from "vue";
import { filterByColumn, sortByColumn } from "@/utils/spreadsheetService";

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

    // Filter and sort fields
    const filterColumn = ref("");
    const filterValue = ref("");
    const sortColumn = ref("");

    // Watch for changes in spreadsheet data and initialize the table
    watch(
      () => props.spreadsheetData,
      (newData) => {
        if (newData && newData.length > 0) {
          tableData.value = newData;
          headers.value = Object.keys(newData[0]); // Set headers based on the keys of the first object
        } else {
          logMessage.value = "No data available in the spreadsheet.";
        }
      },
      { immediate: true } // Trigger watch immediately on component mount
    );

    // Function to apply filters
    const applyFilter = () => {
      if (filterColumn.value && filterValue.value) {
        tableData.value = filterByColumn(
          props.spreadsheetData,
          filterColumn.value,
          filterValue.value
        );
        headers.value = Object.keys(tableData.value[0]);
      }
    };

    // Function to apply sorting
    const applySort = (ascending) => {
      if (sortColumn.value) {
        tableData.value = sortByColumn(
          tableData.value,
          sortColumn.value,
          ascending
        );
      }
    };

    return {
      tableData,
      headers,
      logMessage,
      filterColumn,
      filterValue,
      sortColumn,
      applyFilter,
      applySort,
    };
  },
};
</script>

<style scoped>
.spreadsheet-container {
  margin: 20px;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.data-table th {
  background-color: #f2f2f2;
  text-align: left;
}

.data-table a {
  color: #3498db;
}

.controls {
  margin-bottom: 20px;
}

.controls label {
  margin-right: 5px;
}

.controls input {
  margin-right: 10px;
}
</style>

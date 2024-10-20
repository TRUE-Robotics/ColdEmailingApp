<template>
    <div class="spreadsheet-container">
      <h2>Spreadsheet Data</h2>
  
      <!-- Display log message for errors or information -->
      <div v-if="logMessage">{{ logMessage }}</div>
  
      <!-- Controls for filtering and sorting -->
      <div class="controls">
        <label for="filterColumn">Filter by Column:</label>
        <input v-model="filterColumn" placeholder="Enter column (e.g., 'State')" />
        <label for="filterValue">Value:</label>
        <input v-model="filterValue" placeholder="Enter value (e.g., 'MA')" />
        <button @click="applyFilter">Apply Filter</button>
  
        <label for="sortColumn">Sort by Column:</label>
        <input v-model="sortColumn" placeholder="Enter column (e.g., 'Priority')" />
        <button @click="applySort(true)">Sort Ascending</button>
        <button @click="applySort(false)">Sort Descending</button>
      </div>
  
      <!-- Display data in a table format -->
      <table v-if="tableData.length > 0" class="data-table">
        <thead>
          <tr>
            <th v-for="(header, index) in headers" :key="index">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in tableData" :key="rowIndex">
            <td v-for="(value, colIndex) in row" :key="colIndex">{{ value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import { ref, watch } from 'vue';
  import { filterByColumn, sortByColumn} from '@/utils/spreadsheetService';
  
  export default {
    name: 'SpreadsheetDisplay',
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
      const logMessage = ref('');
  
      // Filter and sort fields
      const filterColumn = ref('');
      const filterValue = ref('');
      const sortColumn = ref('');
  
      // Watch for changes in spreadsheet data and initialize the table
      watch(
        () => props.spreadsheetData,
        (newData) => {
          if (newData && newData.length > 0) {
            tableData.value = newData;
            headers.value = Object.keys(newData[0]); // Set headers based on the keys of the first object
          } else {
            logMessage.value = 'No data available in the spreadsheet.';
          }
        },
        { immediate: true } // Trigger watch immediately on component mount
      );
  
      // Function to apply filters
      const applyFilter = () => {
        if (filterColumn.value && filterValue.value) {
          tableData.value = filterByColumn(props.spreadsheetData, filterColumn.value, filterValue.value);
          headers.value = Object.keys(tableData.value[0]);
        }
      };
  
      // Function to apply sorting
      const applySort = (ascending) => {
        if (sortColumn.value) {
          tableData.value = sortByColumn(tableData.value, sortColumn.value, ascending);
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
  
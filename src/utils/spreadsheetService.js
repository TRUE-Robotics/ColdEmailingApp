
/**
 * Filters the spreadsheet data by a specific column value.
 * @param {Array} data - The spreadsheet data (array of objects).
 * @param {string} column - The column to filter by (e.g., "State", "Priority").
 * @param {*} value - The value to filter by (e.g., "MA", "1").
 * @returns {Array} - The filtered data.
 */
export const filterByColumn = (data, column, value) => {
    if (!Array.isArray(data)) {
      console.error("Data should be an array.");
      return [];
    }
  
    return data.filter(row => row[column] === value);
};
  
/**
 * Sorts the spreadsheet data by a specific column.
 * @param {Array} data - The spreadsheet data (array of objects).
 * @param {string} column - The column to sort by (e.g., "Priority", "State").
 * @param {boolean} ascending - True to sort in ascending order, false for descending.
 * @returns {Array} - The sorted data.
 */
export const sortByColumn = (data, column, ascending = true) => {
    if (!Array.isArray(data)) {
        console.error("Data should be an array.");
        return [];
    }

    return data.sort((a, b) => {
        if (a[column] < b[column]) return ascending ? -1 : 1;
        if (a[column] > b[column]) return ascending ? 1 : -1;
        return 0;
    });
};
  

/**
 * Applies multiple filters to the spreadsheet data.
 * @param {Array} data - The spreadsheet data (array of objects).
 * @param {Array} filters - An array of filter objects with 'column' and 'value' properties.
 * @returns {Array} - The filtered data.
 */
export const applyFilters = (data, filters) => {
    return filters.reduce((filteredData, filter) => {
        return filterByColumn(filteredData, filter.column, filter.value);
    }, data);
};
  
  
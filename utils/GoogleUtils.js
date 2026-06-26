const FormUtils = {
    /**
    * Flattens a Google Form response into a one-dimensional array
    * Converts the structured item responses from a form submission into a simple array
    * where each element represents the answer to one form question in order
    * 
    * @param {GoogleAppsScript.Forms.FormResponse} response - The form response object to flatten
    * @returns {array} - One-dimensional array of response values in order
    */
    flattenResponse: function (response) {
        return response.getItemResponses()
            .map(itemResponse => itemResponse.getResponse());
    },

    /**
     * Retrieves all responses from a Google Form
     * Processes each form response by flattening it and collecting them into a single array
     * 
     * @param {GoogleAppsScript.Forms.Form} form - The form object to retrieve responses from
     * @returns {array<array>} - Array of flattened response arrays
     */
    getFormResponses: function (form) {
        return form.getResponses()
            .map(response => FormUtils.flattenResponse(response));
    }
};

const SpreadsheetUtils = {
    getRangeFromColumn: function(sheet, column) {
        return sheet.getRange(2, column, sheet.getLastRow() - 1, 1);
    },

    getRangeFromRow: function(sheet, row) {
        return sheet.getRange(row, 1, 1, sheet.getLastColumn());
    },

    /**
     * Extracts a one-dimensional array of non-empty values
     * for all rows in a specified column of a spreadsheet
     * 
     * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} sheet - The spreadsheet object to read from
     * @param {int} column - The column number to extract data from (1-indexed)
     * @returns {array} - Array of non-empty values from the specified column
     */
    getColumnData: function(sheet, column) {
        return SpreadsheetUtils.getRangeFromColumn(sheet, column)
            .getValues()
            .flat()
            .filter(value => value !== "");
    },

    /**
     * Extracts a one-dimensional array of non-empty values
     * for all columns in a specified row of a spreadsheet
     * 
     * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} sheet - The spreadsheet object to read from
     * @param {int} row - The row number to extract data from (1-indexed)
     * @returns {array} - Array of non-empty values from the specified row
     */
    getRowData: function(sheet, row) {
        return SpreadsheetUtils.getRangeFromRow(sheet, row)
            .getValues()[0]
            .filter(value => value !== "");
    },

    /**
     * Creates a data validation dropdown for a specified range in the spreadsheet
     * Ensures that cells can only contain values from the specified source range
     * Used to maintain data consistency and prevent invalid entries
     * 
     * @param {string} range - The source range specification (e.g., "Sheet!A2:A1000") for valid values
     * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} directory - The directory spreadsheet object
     * @returns {GoogleAppsScript.Spreadsheet.DataValidation} - A data validation rule ready to apply
     */
    createDropdown : function(column, sheet){
        const sourceRange = SpreadsheetUtils.getRangeFromColumn(sheet, column);
        const validation = SpreadsheetApp.newDataValidation()
            .requireValueInRange(sourceRange)
            .build();
        return validation;
    }
};
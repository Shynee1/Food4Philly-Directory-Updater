/**
 * Extracts a one-dimensional array of non-empty values from a spreadsheet range
 * Iterates through the specified range and collects only the first column values,
 * skipping any empty cells
 * 
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} sheet - The spreadsheet object to read from
 * @param {string} range - The range specification (e.g., "Sheet!A2:A1000")
 * @returns {array} - Array of non-empty values from the first column of the range
 */
function getOneDimensionalSpreadsheetData(sheet, range) {
  const data = sheet.getRange(range).getValues();
  let oneDimensionalData = [];
  for (const entry of data){
    if (entry[0] == "")
      continue;

    oneDimensionalData.push(entry[0]);
  }

  return oneDimensionalData;
}

/**
 * Flattens a Google Form response into a one-dimensional array
 * Converts the structured item responses from a form submission into a simple array
 * where each element represents the answer to one form question in order
 * 
 * @param {GoogleAppsScript.Forms.FormResponse} response - The form response object to flatten
 * @returns {array} - One-dimensional array of response values in order
 */
function flattenResponse(response){
  let flattenedResponse = [];
  const itemResponses = response.getItemResponses();

  for (const itemResponse of itemResponses) {
    flattenedResponse.push(itemResponse.getResponse());
  }

  return flattenedResponse;
}

/**
 * Retrieves all responses from a Google Form
 * Processes each form response by flattening it and collecting them into a single array
 * 
 * @param {GoogleAppsScript.Forms.Form} form - The form object to retrieve responses from
 * @returns {array<array>} - Array of flattened response arrays
 */
function getFormResponses(form) {
  const responses = form.getResponses();
  let allResponses = [];
  for (const response of responses) {
    allResponses.push(flattenResponse(response));
  }

  return allResponses;
}

/**
 * Creates a data validation dropdown for a specified range in the spreadsheet
 * Ensures that cells can only contain values from the specified source range
 * Used to maintain data consistency and prevent invalid entries
 * 
 * @param {string} range - The source range specification (e.g., "Sheet!A2:A1000") for valid values
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} directory - The directory spreadsheet object
 * @returns {GoogleAppsScript.Spreadsheet.DataValidation} - A data validation rule ready to apply
 */
function createDropdown(range, directory){
  const sourceRange = directory.getRange(range); 
  const validation = SpreadsheetApp.newDataValidation()
    .requireValueInRange(sourceRange)
    .build();
  return validation;
}

/**
 * Populates a row in the Members sheet with form response data
 * Merges new data with existing row data, applies proper formatting and validation rules
 * Highlights cells with missing data in red to flag entries needing review
 * Applies appropriate dropdown validation to chapter, team, and grade columns
 * 
 * @param {array} data - The member data to fill in (from FormResponse.data())
 * @param {number} row - The row number to populate (1-indexed)
 * @param {GoogleAppsScript.Spreadsheet.Sheet} memberSheet - The Members sheet to update
 * @param {GoogleAppsScript.Spreadsheet.DataValidation} chapterDropdown - Validation for chapter column
 * @param {GoogleAppsScript.Spreadsheet.DataValidation} teamDropdown - Validation for team column
 * @param {GoogleAppsScript.Spreadsheet.DataValidation} gradeDropdown - Validation for grade column
 * @returns {void}
 */
function fillData(data, row, memberSheet, chapterDropdown, teamDropdown, gradeDropdown){
  const range = memberSheet.getRange(row, 1, 1, data.length);

  var currentData = range.getValues()[0];
  var backgrounds = range.getBackgrounds()[0];
  var dataValidations = range.getDataValidations()[0];

  for (let i = 0; i < currentData.length; i++){
    if (currentData[i] != "")
      continue;

    currentData[i] = data[i];

    if (data[i] == "")
      backgrounds[i] = MISSING_DATA_COLOR;

    if (i == CHAPTER_COLUMN - 1)
      dataValidations[i] = chapterDropdown;
    else if (i == TEAM_COLUMN - 1)
      dataValidations[i] = teamDropdown;
    else if (i == GRADE_COLUMN - 1)
      dataValidations[i] = gradeDropdown;
  }

  range.setValues([currentData])
    .setBackgrounds([backgrounds])
    .setDataValidations([dataValidations]);
}
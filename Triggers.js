/**
 * Google Apps Script trigger handler for form submissions
 * Called automatically whenever a new response is submitted to the Membership Form
 * Coordinates processing of the form response and associated contact creation
 * 
 * @param {GoogleAppsScript.Events.DocsOnOpen} e - The form submission event object containing the response
 * @returns {void}
 */
function handleFormSubmission(e) {
  const directory = SpreadsheetApp.openById(DIRECTORY_SHEET_ID);

  const memberSheet = directory.getSheetByName("Members");

  const members = getOneDimensionalSpreadsheetData(directory, DIRECTORY_MEMBERS_RANGE);
  const chapters = getOneDimensionalSpreadsheetData(directory, DIRECTORY_CHAPTERS_RANGE);

  const chapterDropdown = createDropdown(DIRECTORY_CHAPTERS_RANGE, directory);
  const teamDropdown = createDropdown(DIRECTORY_TEAMS_RANGE, directory);
  const gradeDropdown = createDropdown(DIRECTORY_GRADES_RANGE, directory);

  const response = flattenResponse(e.response);
  const parsedResponse = new FormResponse(response);
  handleResponse(
    parsedResponse, 
    memberSheet, 
    members, 
    chapterDropdown,
    teamDropdown,
    gradeDropdown
  );
  handleContacts(parsedResponse);
}

/**
 * Processes a parsed form response and adds or updates it in the Members sheet
 * Handles duplicate detection, proper row insertion, and team/chapter-based sorting
 * Ensures members are organized by team and chapter in the directory
 * 
 * @param {FormResponse} parsedResponse - The parsed and formatted form response object
 * @param {GoogleAppsScript.Spreadsheet.Sheet} memberSheet - The Members sheet to update
 * @param {array} members - Array of existing member names for duplicate detection
 * @param {GoogleAppsScript.Spreadsheet.DataValidation} chapterDropdown - Validation for chapters
 * @param {GoogleAppsScript.Spreadsheet.DataValidation} teamDropdown - Validation for teams
 * @param {GoogleAppsScript.Spreadsheet.DataValidation} gradeDropdown - Validation for grades
 * @returns {void}
 */
function handleResponse(parsedResponse, memberSheet, members, chapterDropdown, teamDropdown, gradeDropdown){
  const existingDataRow = members.indexOf(parsedResponse.name);

  if (existingDataRow != -1){
    fillData(parsedResponse.data(), existingDataRow + 2, memberSheet, chapterDropdown, teamDropdown, gradeDropdown);
    return; 
  } 

  const lastRow = memberSheet.getLastRow();
  const teamData = memberSheet.getRange(1, TEAM_COLUMN, lastRow).getValues();
  const chapterData = memberSheet.getRange(1, CHAPTER_COLUMN, lastRow).getValues();

  if (parsedResponse.team == "") {
    fillData(parsedResponse.data(), lastRow + 1, memberSheet, chapterDropdown, teamDropdown, gradeDropdown);
    return;
  }

  let insertRow = 0;
  let lastTeamRow = 0; 

  for (let i = 0; i < lastRow; i++) {
    if (teamData[i][0] == parsedResponse.team) {
      lastTeamRow = i + 1; 
      if (chapterData[i][0] == parsedResponse.chapter) {
        insertRow = i + 1; 
      }
    }
  } 

  if (insertRow == 0) {
    insertRow = lastTeamRow;
  }

  if (insertRow == 0) {
    insertRow = lastRow;
  }

  memberSheet.insertRowAfter(insertRow);
  fillData(parsedResponse.data(), insertRow + 1, memberSheet, chapterDropdown, teamDropdown, gradeDropdown);
}

/**
 * Creates or updates Wix CMS contacts for a new form submission
 * Handles both member and parent contact creation with appropriate labels
 * Parses full names, normalizes team/role labels, and manages parent email entries
 * 
 * @param {FormResponse} parsedResponse - The parsed form response containing member information
 * @returns {void}
 */
function handleContacts(parsedResponse){
  const names = splitName(parsedResponse.name);
  const chapterHeadLabel = normalizeLabel("Chapter Head");

  if (parsedResponse.team == "Unsure" || parsedResponse.team == "")
    parsedResponse.team = "Member";
  
  let labels = [normalizeLabel(parsedResponse.team)];
  if (hasChapterHead(parsedResponse.title) && !labels.includes(chapterHeadLabel)){
    labels.append(chapterHeadLabel);
  }

  WixService.createContact(names.first, names.last, parsedResponse.email, parsedResponse.phone, labels);
  
  if (parsedResponse.parentEmail){
    const emails = parsedResponse.parentEmail.split(",");
    for (let i = 0; i < emails.length; i++){
      const email = emails[i];
      const parentName = `${parsedResponse.name} - Parent ${i}`
      const splitNames = splitName(parentName);
      const parentLabels = [normalizeLabel("Parent")];
      WixService.createContact(splitNames.first, splitNames.last, email, "", parentLabels);
    }
  }
}
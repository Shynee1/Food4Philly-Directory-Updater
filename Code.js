// Unique Google IDs to access both the Food4Philly Directory and the Membership form
const DIRECTORY_SHEET_ID = "1E62O579akZotUWhNHhoeEPbD0B0EfqnjNsd6PkXKl2U";
const MEMBERSHIP_FORM_ID = "1LhFn2vs-ynFnbn_RuanaPhLzPzqYA3Cs8S8EFAH2kmk";
// Unique ranges to access specific data on the Directory spreadsheet 
const DIRECTORY_CHAPTERS_RANGE = "Chapters!A2:A1000";
const DIRECTORY_TEAMS_RANGE = "Teams!A2:A1000";
const DIRECTORY_GRADES_RANGE = "Grades!A2:A1000";
const DIRECTORY_MEMBERS_RANGE = "Members!A2:A1000";
// Column indices for chapter, team, and grade
const CHAPTER_COLUMN = 3;
const TEAM_COLUMN = 6;
const GRADE_COLUMN = 7;
// Hex code to color cell with any missing data
const MISSING_DATA_COLOR = "#f4cccc";

/**
 * Registers a Google Apps Script trigger for the program
 * The function 'handleFormSubmission' (located in Triggers.gs) will be run when a new response is submitted
 */
function registerTriggers() {
  const membershipForm = FormApp.openById(MEMBERSHIP_FORM_ID);

  ScriptApp.newTrigger('handleFormSubmission')
    .forForm(membershipForm)
    .onFormSubmit()
    .create();
}

/**
 * Updates the Food4Philly directory with all new responses to the Membership Form
 * Should be run once to batch update with all new entries
 */
function updateFullDirectory(){ 
  const directory = SpreadsheetApp.openById(DIRECTORY_SHEET_ID);
  const membershipForm = FormApp.openById(MEMBERSHIP_FORM_ID);

  const responses = getFormResponses(membershipForm);

  const memberSheet = directory.getSheetByName("Members");
  
  const members = getOneDimensionalSpreadsheetData(directory, DIRECTORY_MEMBERS_RANGE);
  const chapters = getOneDimensionalSpreadsheetData(directory, DIRECTORY_CHAPTERS_RANGE);

  const chapterDropdown = createDropdown(DIRECTORY_CHAPTERS_RANGE, directory);
  const teamDropdown = createDropdown(DIRECTORY_TEAMS_RANGE, directory);
  const gradeDropdown = createDropdown(DIRECTORY_GRADES_RANGE, directory);
  
  for (response of responses){
    handleResponse(
      response, 
      memberSheet, 
      members, 
      chapters,
      chapterDropdown,
      teamDropdown,
      gradeDropdown
    );  
  }
}



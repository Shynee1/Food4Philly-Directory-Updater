// Unique Google IDs to access both the Food4Philly Directory and the Membership form
const DIRECTORY_SHEET_ID = "1E62O579akZotUWhNHhoeEPbD0B0EfqnjNsd6PkXKl2U";
const MEMBERSHIP_FORM_ID = "1LhFn2vs-ynFnbn_RuanaPhLzPzqYA3Cs8S8EFAH2kmk";
// Unique column indices to access specific data on the Directory spreadsheet 
const MEMBERS_MEMBER_COLUMN = 1;
const MEMBERS_CHAPTER_COLUMN = 3;
const MEMBERS_TEAM_COLUMN = 6;
const MEMBERS_GRADE_COLUMN = 7;
const CHAPTERS_CHAPTER_COLUMN = 1;
const GRADES_GRADE_COLUMN = 1;
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
    const membershipForm = FormApp.openById(MEMBERSHIP_FORM_ID);
    const responses = FormUtils.getFormResponses(membershipForm);

    SheetData.initialize();

    for (response of responses){
        const directoryEntry = Entry.fromFormResponse(response);
        SheetHandler.processEntry(directoryEntry);
        WixHandler.processEntry(directoryEntry);
    }
}

function test() {
    console.log(WixUtils.contactExists("", "noone@example.com", ""));
    console.log(WixUtils.contactExists("Jack Ford", "jackbarkerford@gmail.com", "610-888-9511"));
    console.log(WixUtils.memberExists("Jack Ford", "jackerford@gmail.com", "610-888-9511"));
}

/**
 * Google Apps Script trigger handler for form submissions
 * Called automatically whenever a new response is submitted to the Membership Form
 * Coordinates processing of the form response and associated contact creation
 * 
 * @param {GoogleAppsScript.Events.DocsOnOpen} e - The form submission event object containing the response
 * @returns {void}
 */
function handleFormSubmission(e) {
    SheetData.initialize();
    const entry = Entry.fromFormResponse(e.response);
    SheetHandler.processEntry(entry);
    WixHandler.processEntry(entry);
}



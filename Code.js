/**
 * Registers all Google Apps Script triggers for the program
 */
function registerTriggers() {
    const membershipForm = FormApp.openById(SheetData.MEMBERSHIP_FORM_ID);

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
    const membershipForm = FormApp.openById(SheetData.MEMBERSHIP_FORM_ID);
    const responses = FormUtils.getFormResponses(membershipForm);

    SheetData.initialize();

    for (response of responses){
        const entry = Entry.fromFormResponse(response);
        SheetHandler.processFormResponse(entry);
        WixHandler.processFormResponse(entry);
    }
}

function test() {
    
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
    
    SheetHandler.processFormResponse(entry);
    WixHandler.processFormResponse(entry);
}



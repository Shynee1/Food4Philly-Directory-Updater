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
function addAllFormResponses(){ 
    const membershipForm = FormApp.openById(SheetData.MEMBERSHIP_FORM_ID);
    const responses = FormUtils.getFormResponses(membershipForm);

    SheetData.initialize();

    for (response of responses){
        const entry = Entry.fromFormResponse(response);
        SheetHandler.processFormResponse(entry);
        WixHandler.processFormResponse(entry);
    }
}

/**
 * Subscribes all contacts in the Wix database to the newsletter
 * Should be run once to batch subscribe all existing contacts
 */
function subscribeAllContacts() {
    const contacts = WixService.queryAllContacts();
    console.log(`Subscribing ${contacts.length} contacts to the newsletter`);

    for (contact of contacts) {
        const name = contact?.info?.name?.first + " " + contact?.info?.name?.last;
        const email = contact?.primaryEmail?.email;
        console.log(`Subscribing ${name} to the newsletter`);
        WixService.subscribeContact(email);
    }
}

/**
 * Test function to verify that the SheetHandler and WixHandler are working correctly
 */
function test() {
    SheetData.initialize();

    const entry = new Entry();
    entry.name = "Test User";
    entry.email = "test@gmail.com";
    entry.phone = "123-456-7890";
    entry.chapter = "The Haverford School";
    entry.team = "Executive";
    entry.grade = "Senior";
    entry.title = "Testing Manager";
    entry.parentEmails = ["test_parent@gmail.com"];

    SheetHandler.processFormResponse(entry);
    WixHandler.processFormResponse(entry);
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



# Food4Philly Directory Updater

This Google Apps Script project automates the process of maintaining Food4Philly's member directory by integrating with a Google Form. The script extracts, cleans, and appends membership data to the directory spreadsheet, ensuring consistency and reducing manual data entry errors.

## Why This Project is Necessary

Food4Philly has a large and growing member base across various chapters. Managing this data manually is time-consuming and prone to errors. This program ensures:

- **Efficiency**: Automates data cleaning and organization.
- **Accuracy**: Standardizes member details, including names, phone numbers, and chapters.
- **Scalability**: Handles a growing number of form responses seamlessly.

## Features

1. **Automatic Data Cleaning**:
   - Formats phone numbers to `xxx-xxx-xxxx`.
   - Normalizes names to "First Last" capitalization.
   - Matches chapters using fuzzy string matching for consistency.

2. **Integration with Google Form and Google Sheets**:
   - Processes new membership form submissions automatically.
   - Appends cleaned data to the directory spreadsheet.

3. **Validation and Alerts**:
   - Highlights missing data in the directory with a specific color (`#f4cccc`).
   - Validates entries against predefined chapter, team, and grade lists.

4. **Custom Sorting**:
   - Ensures members are grouped by teams and chapters in the directory.

## Setup Instructions

### Prerequisites
- Access to the Food4Philly Membership Form
- Access to the Food4Philly Directory spreadsheet
- Access to the Food4Philly Gmail account

### Installation & Setup
1. Open Google Apps Script at [script.google.com](https://script.google.com).
2. Create a new project and copy the contents of the following files:
   - `FormResponse.gs`
   - `Main.gs`
   - `Triggers.gs`
   - `GoogleHelper.gs`
3. Replace the placeholders for:
   - `DIRECTORY_SHEET_ID`: The Google Sheet ID of the member directory.
   - `MEMBERSHIP_FORM_ID`: The Google Form ID for membership submissions.
4. Run the `registerTriggers()` function to link the script to the Google Form.'
   - This ensures `handleFormSubmission` is triggered automatically for each new submission.
5. To process all pending form submissions in bulk, manually run the `updateFullDirectory()` function from the Apps Script editor.
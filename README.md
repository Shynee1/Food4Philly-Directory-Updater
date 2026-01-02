# Food4Philly Directory Updater

This Google Apps Script project automates the process of maintaining Food4Philly's member directory by integrating with a Google Form. The script extracts, cleans, and appends membership data to the directory spreadsheet, ensuring consistency and reducing manual data entry errors. In addition, the script automatically adds members to Food4Philly's Wix CRM for emailing convenience. 

## Why This Project is Necessary

Food4Philly has a large and growing member base across various chapters. Managing this data manually is time-consuming and prone to errors. This program ensures:
Food4Philly's 
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
   - Highlights missing data in the directory.
   - Validates entries against predefined chapter, team, and grade lists.

4. **Custom Sorting**:
   - Ensures members are grouped by teams and chapters in the directory.
  
5. **WIX Integration**
   - Uses WIX's REST API to automatically add members to Food4Philly's WIX CRM. 

## Setup Instructions

### Prerequisites
- Access to the Food4Philly Membership Form
- Access to the Food4Philly Directory spreadsheet
- Access to the Food4Philly Gmail account
- Git is installed locally

### Installation & Setup
1. Download the [Google Apps Script CLI Tool](https://github.com/google/clasp)
2. Login to Google using the command
```clasp login```
2. Clone this repository using the command
```git clone https://github.com/Shynee1/Food4Philly-Directory-Updater.git```
3. Create a new Apps Script project with the command
```clasp create-script --type sheets --title "Food4Philly Directory Updater"```
4. Push local code to the cloud using the command
```clasp push```
5. Navigate to the [Apps Script Cloud Dashboard](https://script.google.com/home)
6. Run the `registerTriggers()` function to link the script to the Google Form.
   - This ensures `handleFormSubmission` is triggered automatically for each new submission.
7. To process all pending form submissions in bulk, manually run the `updateFullDirectory()` function from the Apps Script editor.
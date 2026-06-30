const SheetData = {
    // Unique Google IDs to access both the Food4Philly Directory and the Membership form
    DIRECTORY_SHEET_ID: "1E62O579akZotUWhNHhoeEPbD0B0EfqnjNsd6PkXKl2U",
    MEMBERSHIP_FORM_ID: "1LhFn2vs-ynFnbn_RuanaPhLzPzqYA3Cs8S8EFAH2kmk",
    // Unique column indices to access specific data on the Directory spreadsheet 
    MEMBERS_MEMBER_COLUMN: 1,
    MEMBERS_CHAPTER_COLUMN: 3,
    MEMBERS_TEAM_COLUMN: 6,
    MEMBERS_GRADE_COLUMN: 7,
    CHAPTERS_CHAPTER_COLUMN: 1,
    GRADES_GRADE_COLUMN: 1,
    // Hex code to color cell with any missing data
    MISSING_DATA_COLOR: "#f4cccc",
    
    // Spreadsheet object for the Food4Philly directory
    directory: null,
    // Sheets objects for each of the sheets inside the directory
    memberSheet: null,
    chapterSheet: null,
    teamSheet: null,
    gradeSheet: null,
    // Dropdowns created once with chapter information
    chapterDropdown: null,
    teamDropdown: null,
    gradeDropdown: null,
    // Arrays of all chapters and teams
    chapters: null,
    teams: null,

    initialize: function() {
        this.directory = SpreadsheetApp.openById(DIRECTORY_SHEET_ID);
        this.memberSheet = this.directory.getSheetByName("Members");
        this.teamSheet = this.directory.getSheetByName("Teams");
        this.chapterSheet = this.directory.getSheetByName("Chapters");
        this.gradeSheet = this.directory.getSheetByName("Grades");
        this.chapterDropdown = FormUtils.createDropdown(CHAPTERS_CHAPTER_COLUMN, this.chapterSheet);
        this.teamDropdown = FormUtils.createDropdown(TEAMS_TEAM_COLUMN, this.teamSheet);
        this.gradeDropdown = FormUtils.createDropdown(GRADES_GRADE_COLUMN, this.gradeSheet);
        this.chapters = SheetUtils.getColumnData(this.chapterSheet, CHAPTERS_CHAPTER_COLUMN);
        this.teams = SheetUtils.getColumnData(this.teamSheet, TEAMS_TEAM_COLUMN);
    }
};
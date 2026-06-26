const SheetData = {
    directory: null,
    memberSheet: null,
    chapterSheet: null,
    teamSheet: null,
    gradeSheet: null,
    chapterDropdown: null,
    teamDropdown: null,
    gradeDropdown: null,
    members: null,
    chapters: null,

    initialize: function() {
        this.directory = SpreadsheetApp.openById(DIRECTORY_SHEET_ID);
        this.memberSheet = this.directory.getSheetByName("Members");
        this.teamSheet = this.directory.getSheetByName("Teams");
        this.chapterSheet = this.directory.getSheetByName("Chapters");
        this.gradeSheet = this.directory.getSheetByName("Grades");
        this.chapterDropdown = FormUtils.createDropdown(CHAPTERS_CHAPTER_COLUMN, this.chapterSheet);
        this.teamDropdown = FormUtils.createDropdown(TEAMS_TEAM_COLUMN, this.teamSheet);
        this.gradeDropdown = FormUtils.createDropdown(GRADES_GRADE_COLUMN, this.gradeSheet);
        this.members = SpreadsheetUtils.getColumnData(this.memberSheet, MEMBERS_MEMBER_COLUMN);
        this.chapters = SpreadsheetUtils.getColumnData(this.chapterSheet, CHAPTERS_CHAPTER_COLUMN);
        this.teams = SpreadsheetUtils.getColumnData(this.teamSheet, TEAMS_TEAM_COLUMN);
        this.grades = SpreadsheetUtils.getColumnData(this.gradeSheet, GRADES_GRADE_COLUMN);
    }
};
const SheetHandler = {
    /**
     * Processes a new form response by determining if it's a new or existing entry and updating accordingly
     * @param {Entry} entry 
     * @return {void}
     */
    processFormResponse: function(entry) {
        const index = this.findIndexOf(entry);
        if (index == -1){
            this.fillData(entry.data(), index);
        } else {
            const row = this.findAvailableRow(entry.team, entry.chapter);
            SheetData.memberSheet.insertRowBefore(row);
            this.fillData(entry.data(), row);
        }
    },

    /**
     * Populates a row in the Members sheet with form response data
     * Merges new data with existing row data, applies proper formatting and validation rules
     * Highlights cells with missing data in red to flag entries needing review
     * Applies appropriate dropdown validation to chapter, team, and grade columns
     * 
     * @param {array} data - The member data to fill in (from FormResponse.data())
     * @param {number} row - The row number to populate (1-indexed)
     * @returns {void}
     */
    fillData : function(data, row){
        const range = SheetData.memberSheet.getRange(row, 1, 1, data.length);

        var currentData = range.getValues()[0];
        var backgrounds = range.getBackgrounds()[0];
        var dataValidations = range.getDataValidations()[0];

        for (let i = 0; i < currentData.length; i++){
            if (currentData[i] != "" && data[i] == "")
                continue;

            currentData[i] = data[i];

            if (data[i] == "")
                backgrounds[i] = SheetData.MISSING_DATA_COLOR;

            if (i == CHAPTER_COLUMN - 1)
                dataValidations[i] = SheetData.chapterDropdown;
            else if (i == TEAM_COLUMN - 1)
                dataValidations[i] = SheetData.teamDropdown;
            else if (i == GRADE_COLUMN - 1)
                dataValidations[i] = SheetData.gradeDropdown;
        }

        range.setValues([currentData])
            .setBackgrounds([backgrounds])
            .setDataValidations([dataValidations]);
    },

    /**
     * Finds the appropriate row to insert new member data based on team and chapter affiliation
     * Orders by team, then chapter within team, to maintain organization of the directory
     * @param {Entry} entry Directory entry for which to find the appropriate row
     * @returns {int} index of the row to fill in (1-indexed)
     */
    findAvailableRow: function(entry) {
        const lastRow = SheetData.memberSheet.getLastRow() + 1;
        const searchTeam = (entry.team == "") ? "Member" : entry.team;
        let lastChapterRow = lastRow;
        let lastTeamRow = lastRow;

        for (let i = lastRow - 1; i >= 0; i--){
            if (SheetData.teams[i] == searchTeam){
                if (lastTeamRow == lastRow) {
                    lastTeamRow = i + 1;
                }

                if (SheetData.chapters[i] == entry.chapter){
                    lastChapterRow = i + 1;
                    break;
                }
            }
        }

        if (lastChapterRow == lastRow) lastChapterRow = lastTeamRow;

        return lastChapterRow + 1;
    },

    findIndexOf: function(entry) {
        const textFinder = SheetData.memberSheet.createTextFinder(entry.name);
        textFinder.matchCase(true).matchEntireCell(true);
        while (textFinder.findNext() != null) {
            const row = textFinder.getCurrentMatch().getRow();
            const foundEntry = Entry.fromDirectory(row);
            if (foundEntry.equals(entry)) {
                return row;
            }
        }
        return -1;
    }
};
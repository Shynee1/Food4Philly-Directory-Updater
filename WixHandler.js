const WixHandler = {
    processEntry: function(entry){
        this.createContacts(entry);
    },

    /**
     * Creates or updates Wix CMS contacts for a new form submission
     * Handles both member and parent contact creation with appropriate labels
     * Parses full names, normalizes team/role labels, and manages parent email entries
     * 
     * @param {Entry} entry - The form entry containing member information
     * @returns {void}
     */
    createContacts: function(entry){
        const chapterHeadLabel = WixUtils.normalizeLabel("Chapter Head");

        if (entry.team == "Unsure" || entry.team == "")
            entry.team = "Member";
    
        let labels = [WixUtils.normalizeLabel(entry.team)];
        if (WixUtils.hasChapterHead(entry.title) && !labels.includes(chapterHeadLabel)){
            labels.push(chapterHeadLabel);
        }

        WixService.createContact(entry.name, entry.email, entry.phone, labels);
    
        if (entry.parentEmail){
            const emails = entry.parentEmail.split(",");
            for (let i = 0; i < emails.length; i++){
                const email = emails[i];
                const parentName = `${entry.name} - Parent ${i}`
                const parentLabels = [WixUtils.normalizeLabel("Parent")];
                WixService.createContact(parentName, email, "", parentLabels);
            }
        }
    }
};
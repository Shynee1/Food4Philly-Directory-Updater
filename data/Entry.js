class Entry {
    /**
     * Represents an entry in the Food4Philly directory
     * Takes in a raw form response and reformats it to match the directory format
     * 
     * @param {array} formResponse - The raw data supplied by the google form
     * @constructor
     */
    static fromFormResponse(formResponse) {
        // Create fuzzy string matching class 
        const fuzzyMatching = FuzzySet(SheetData.chapters);
        const response = FormUtils.flattenResponse(formResponse);

        const entry = new Entry();
        entry.name  = entry.cleanName(response[0]);
        entry.email = response[1].toLowerCase().trim();
        entry.phone = entry.cleanPhone(response[2]);
        entry.chapter = entry.matchChapter(response[3], fuzzyMatching);
        entry.team = entry.cleanTeam(response[4]);
        entry.grade = response[5] || "Senior";
        entry.title = entry.getTitle(entry.team);
        entry.parentEmails = entry.splitEmails(response[6]);
        return entry;
    }

    /**
     * Represents an entry in the Food4Philly directory
     * Takes in an index of a row in the directory and retrieves 
     * all data from that row to create an entry object
     * @param {int} rowIndex 
     */
    static fromDirectory(rowIndex) {
        const memberSheet = SheetData.memberSheet;
        const memberData = SheetUtils.getRowData(memberSheet, rowIndex);

        const entry = new Entry();
        entry.name = memberData[0];
        entry.title = memberData[1];
        entry.chapter = memberData[2];
        entry.email = memberData[3];
        entry.phone = memberData[4];
        entry.team = memberData[5];
        entry.grade = memberData[6];
        entry.parentEmails = entry.splitEmails(memberData[7]);
        return entry;
    }

    /**
     * Converts a user-entered phone number into the format xxx-xxx-xxxx
     * Example: "123456 7890" --> "123-456-7890"
     * 
     * @param {string} phone - The raw phone number entered by user
     * @returns {string} - The properly formatted phone number
     */
    cleanPhone(phone){
        // Remove all '-' characters  
        const rawPhone = phone.replace(/[-() ]/g, "").trim();

        // Make sure user entered a 10 digit phone number
        if (rawPhone.length !== 10)
            return "";
        
        // Reformat string to xxx-xxx-xxxx
        return `${rawPhone.substring(0, 3)}-${rawPhone.substring(3, 6)}-${rawPhone.substring(6)}`;
    }

    /**
     * Converts a user-entered name into the proper directory format
     * Removes all non-ascii characters and capitializes the first letter of first and last names
     * Example: "fInn KElly" --> "Finn Kelly"
     * 
     * @param {string} name - The raw name entered by the user
     * @returns {string} - The properly formatted name
     */
    cleanName(name){
        let finalName = "";
        let capitalizeNext = true;

        // Read every character of the name 
        for (let i = 0; i < name.length; i++){
            const char = name[i];
            
            // Remove emojis/special characters
            if (!/^[\x00-\xFF]*$/.test(char))
                continue;
            
            // Handle capitalizing letters 
            if (char == ' '){
                finalName += char;
                capitalizeNext = true;
            } else if (capitalizeNext){
                finalName += char.toUpperCase();
                capitalizeNext = false;
            } else {
                finalName += char.toLowerCase();
            }
        }

        return finalName.trim();
    }

    /**
     * Matches a user-entered chapter with a list of valid chapters
     * Example 1: "Haverford" --> "The Haverford School"
     * Example 2: "Wissahickon HS" --> "Wissahickon High School"
     * 
     * @param {string} chapter - The user-entered chapter that needs to be matched
     * @param {FuzzySet} matchingSet - Class to handle fuzzy string matching with valid chapters
     * @return {string} - The closest matching chapter to the user input or "" if a match cannot be found
     */
    matchChapter(chapter, matchingSet){
        const lowerCase = chapter.toLowerCase();

        // Handle school-specific edge cases  
        if (lowerCase.includes("mitty"))
            return "Food4TheBay";
        if (lowerCase.includes("seneca valley"))
            return "Food4Pitt"
        if (lowerCase == "ais")
            return "The Agnes Irwin School"
        if (lowerCase == "lm")
            return "Lower Merion High School"
        if (lowerCase == "ths")
            return "The Haverford School"
        if (lowerCase == "hhs")
            return "Harriton High School"

        // Use fuzzy string matching to match user input to the valid chapters
        const matches = matchingSet.get(chapter);

        // If no match can be found, return an empty string
        if (matches == null)
            return "";

        return matches[0][1];  
    }

    cleanTeam(team){
        if (team == "")
            return "Member";
        
        if (team == "Unsure")
            return "";
        
        return team;
    }

    /**
     * Creates a title based on the member's team
     * If they are not a chapter head or a member, leaves it blank
     * @param {string} team - The Food4Philly team the member is a part of
     * @returns {string} - Title of the entry or blank
     */
    getTitle(team) {
        return (team == "Member" || team == "Chapter Head") ? team : "";
    }

    /**
     * Splits a string of emails into an array of individual emails
     * @param {string} emailString - A string containing comma-separated email addresses
     * @returns {array} - An array of individual email addresses
     */
    splitEmails(emailString){
        return emailString.split(",").map(email => email.trim().toLowerCase()).filter(email => email !== "");
    }

    /**
     * Returns form response data in one dimensional array
     * Order: name, title, chapter, email, phone, team, grade, parent emails
     * @returns {array} - Data ordered to match directory
     */
    data() {
        return [this.name, this.title, this.chapter, this.email, this.phone, this.team, this.grade, this.parentEmails];
    }

    equals(other) {
        return this.name === other.name &&
               this.email === other.email &&
               this.phone === other.phone &&
               this.chapter === other.chapter &&
               this.team === other.team &&
               this.grade === other.grade;
    }
}
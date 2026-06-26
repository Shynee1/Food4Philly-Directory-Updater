const WixUtils = {

    /**
     * Splits a full name into first and last name components
     * Handles single names by returning the full string as first name with empty last name
     * Removes excess whitespace and normalizes name formatting
     * Example: "John Smith Jr." --> {first: "John", last: "Smith Jr."}
     * 
     * @param {string} fullName - The complete name to split
     * @returns {object} - Object with {first: firstName, last: lastName}
     */
    splitName: function(fullName) {
        if (!fullName) {
            return { first: "", last: "" };
        }

        const parts = fullName
            .toString()
            .trim()
            .replace(/\s+/g, " ")
            .split(" ");

        if (parts.length === 1) {
            return { first: parts[0], last: "" };
        }

        return {
            first: parts.shift(),
            last: parts.join(" ")
        };
    },

    /**
     * Converts a label string into a normalized custom field key for Wix API
     * Removes special characters, converts to camelCase, and prefixes with "custom."
     * Ensures the output is compatible with Wix's custom field naming requirements
     * Example: "Chapter Head" --> "custom.chapterHead"
     * 
     * @param {string} label - The raw label text to normalize
     * @returns {string|null} - The normalized label as "custom.camelCaseLabel" or null if input is falsy
     */
    normalizeLabel: function(label) {
        if (!label) return null;

        label = label
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9_ ]+/g, "")
            .replace(/\s+(\w)/g, (match, char) => char.toUpperCase());

        return "custom." + label;
    },

    /**
     * Checks if a title string contains the "Chapter Head" designation
     * Useful for identifying leadership roles in member data
     * Performs case-insensitive matching and handles comma-separated titles
     * Example: "Strategy, Chapter Head" --> true
     * 
     * @param {string} title - The title string to search
     * @returns {boolean} - True if "chapter head" is found, false otherwise
     */
    hasChapterHead: function(title) {
        if (!title) return false;

        return title
            .split(",")
            .some(part => part.trim().toLowerCase().includes("chapter head"));
    },

    contactExists: function(email){
        return WixService.queryContact(email) !== null;
    },

    memberExists: function(email){
        return WixService.queryMember(email) !== null;
    }
};

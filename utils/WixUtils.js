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

    contactExists: function(entry){
        return WixService.queryContact(entry.name, entry.email, entry.phone) !== null;
    }
};

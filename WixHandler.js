const WixHandler = {
    /**
     * Processes a form response by creating or updating a Wix CMS contact
     * @param {Entry} entry The form entry containing member information
     * @returns {void}
     */
    processFormResponse: function(entry){
        const contact = WixService.queryContact(entry.name, entry.email, entry.phone);
        if (contact == null) {
            this.createContacts(entry);
            console.log(`Created new contact for ${entry.name} in Wix CMS`);
        }
        else {
            this.updateContacts(entry, contact);
            console.log(`Updated existing contact for ${entry.name} in Wix CMS`);
        }
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
        const labels = [WixUtils.normalizeLabel("Directory")];
        WixService.createContact(entry.name, entry.email, entry.phone, labels);
        WixService.subscribeContact(entry.email);
    
        if (entry.parentEmail){
            const emails = entry.parentEmail.split(",");
            for (let i = 0; i < emails.length; i++){
                const email = emails[i];
                const parentName = `${entry.name} - Parent ${i + 1}`
                const parentLabels = [WixUtils.normalizeLabel("Parent")];
                WixService.createContact(parentName, email, "", parentLabels);
                WixService.subscribeContact(email);
            }
        }
    },

    /**
     * Updates an existing Wix CMS contact with new information
     * @param {Entry} entry The form entry containing updated member information
     * @param {Object} contact The existing Wix CMS contact to update
     * @returns {void}
     */
    updateContacts: function(entry, contact) {
        const parentEmails = entry.parentEmails;
        for (let i = 0; i < parentEmails.length; i++) {
            const parentName = `${entry.name} - Parent ${i + 1}`;
            const parentLabels = [WixUtils.normalizeLabel("Parent")];
            const currentContact = WixService.queryContact(parentName, null, null);

            if (currentContact == null) {
                WixService.createContact(parentName, parentEmails[i], "", parentLabels);
            }
            else if (currentContact.email != parentEmails[i]) {
                WixService.updateContact(currentContact, parentName, parentEmails[i], "", parentLabels);
            }

            WixService.subscribeContact(parentEmails[i]);
        }
    
        let labels = [WixUtils.normalizeLabel("Directory")];
        WixService.updateContact(contact, entry.name, entry.email, entry.phone, labels);
        WixService.subscribeContact(entry.email);
    }
};
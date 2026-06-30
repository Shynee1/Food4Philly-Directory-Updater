const WixHandler = {
    processFormResponse: function(entry){
        const contact = WixService.queryContact(entry.name, entry.email, entry.phone);
        if (contact == null) {
            this.createContacts(entry);
        }
        else {
            this.updateContacts(entry, contact);
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
        this.createContact(entry.name, entry.email, entry.phone, labels);
    
        if (entry.parentEmail){
            const emails = entry.parentEmail.split(",");
            for (let i = 0; i < emails.length; i++){
                const email = emails[i];
                const parentName = `${entry.name} - Parent ${i + 1}`
                const parentLabels = [WixUtils.normalizeLabel("Parent")];
                this.createContact(parentName, email, "", parentLabels);
            }
        }
    },

    updateContacts: function(entry, contact) {
        const parentEmails = entry.parentEmails;
        for (let i = 0; i < parentEmails.length; i++) {
            const parentName = `${entry.name} - Parent ${i + 1}`;
            const parentLabels = [WixUtils.normalizeLabel("Parent")];
            const currentContact = WixService.queryContact(parentName, null, null);

            if (currentContact == null) {
                this.createContact(parentName, parentEmails[i], "", parentLabels);
            }
            else if (currentContact.email != parentEmails[i]) {
                WixService.updateContact(currentContact, parentName, parentEmails[i], "", parentLabels);
            }
        }
    
        let labels = [WixUtils.normalizeLabel("Directory")];
        WixService.updateContact(contact, entry.name, entry.email, entry.phone, labels);
    },

    createContact: function(name, email, phone, labels) {
        WixService.createContact(name, email, phone, labels);
    
        if (response && response.status === 409) {
            const existingContact = WixService.queryContact(name, email, phone);
            if (existingContact) {
                WixService.updateContact(existingContact, name, email, phone, labels);
            }
        }

        WixService.subscribeContact(email);
    }
};
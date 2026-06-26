const WixData = {
    members: [],
    contacts: [],
    initialize: function() {
        this.members = WixService.queryAllMembers();
        this.contacts = WixService.queryAllContacts();
    }
}
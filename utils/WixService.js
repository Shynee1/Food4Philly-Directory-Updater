/**
 * Service class for interacting with the Wix API
 * Manages OAuth2 authentication and contact management for the Wix CMS
 * Handles token caching to minimize API calls and improve performance
 */
const WixService = {

    accessToken: "",
    accessTokenExpiryTime: 0,

    /**
     * Obtains a valid OAuth2 access token for Wix API authentication
     * Caches the token and reuses it until expiration, reducing unnecessary API calls
     * Retrieves credentials from Google Apps Script properties
     * 
     * @static
     * @returns {string} - Valid access token for Wix API requests
     * @throws {Error} - If token retrieval fails or API returns an error
     */
    getAccessToken: function() {
        const now = Date.now();

        if (WixService.accessToken && now < WixService.accessTokenExpiryTime - 60000) {
            return WixService.accessToken;
        }

        const props = PropertiesService.getScriptProperties();

        const payload = {
            grant_type: "client_credentials",
            client_id: props.getProperty("WIX_APP_ID"),
            client_secret: props.getProperty("WIX_APP_SECRET"),
            instanceId: props.getProperty("WIX_INSTANCE_ID")
        };

        const response = UrlFetchApp.fetch(
            "https://www.wixapis.com/oauth2/token",
            {
                method: "post",
                contentType: "application/json",
                payload: JSON.stringify(payload),
                muteHttpExceptions: true
            }
        );

        const data = JSON.parse(response.getContentText());

        if (!data.access_token) {
            throw new Error("Failed to obtain Wix access token: " + response.getContentText());
        }

        this.accessToken = data.access_token;
        this.accessTokenExpiryTime = now + (data.expires_in * 1000);

        return this.accessToken;
    },

    /**
     * Makes an authenticated POST request to the Wix API
     * Automatically obtains an access token and includes it in the authorization header
     * Handles API responses with error logging for failed requests
     * 
     * @static
     * @param {string} endpoint - The API endpoint path (e.g., "/contacts/v4/contacts")
     * @param {object} payload - The request body data to send as JSON
     * @returns {object} - Object containing {code: responseCode, body: responseText}
     */
    wixPost: function(endpoint, payload) {
        const token = this.getAccessToken();

        const response = UrlFetchApp.fetch(
            "https://www.wixapis.com" + endpoint,
            {
                method: "post",
                contentType: "application/json",
                headers: {
                    Authorization: "Bearer " + token
                },
                payload: JSON.stringify(payload),
                muteHttpExceptions: true
            }
        );

        const code = response.getResponseCode();
        const text = response.getContentText();

        if (code !== 200 && code !== 201) {
            console.error("Wix API Error:", text);
        }

        return { code, body: text };
    },

    /**
     * Makes an authenticated GET request to the Wix API
     * Automatically obtains an access token and includes it in the authorization header
     * Handles API responses with error logging for failed requests
     * 
     * @static
     * @param {string} endpoint - The API endpoint path (e.g., "/contacts/v4/contacts")
     * @returns {object} - Object containing {code: responseCode, body: responseText}
     */
    wixGet: function(endpoint) {
        const token = this.getAccessToken();
        const response = UrlFetchApp.fetch(
            "https://www.wixapis.com" + endpoint,
            {   
                method: "get",
                headers: {
                    Authorization: "Bearer " + token
                },
                muteHttpExceptions: true
            }
        );

        const code = response.getResponseCode();
        const text = response.getContentText();

        if (code !== 200) {
            console.error("Wix API Error:", text);
        }

        return { code, body: text };
    },

    /**
     * Makes an authenticated PATCH request to the Wix API
     * Automatically obtains an access token and includes it in the authorization header
     * Handles API responses with error logging for failed requests
     * 
     * @static
     * @param {string} endpoint - The API endpoint path (e.g., "/contacts/v4/contacts")
     * @param {object} payload - The request body data to send as JSON
     * @returns {object} - Object containing {code: responseCode, body: responseText}
     */
    wixPatch: function(endpoint, payload) {
        const token = this.getAccessToken();

        const response = UrlFetchApp.fetch(
            "https://www.wixapis.com" + endpoint,
            {
                method: "patch",
                contentType: "application/json",
                headers: {
                    Authorization: "Bearer " + token
                },
                payload: JSON.stringify(payload),
                muteHttpExceptions: true
            }
        );

        const code = response.getResponseCode();
        const text = response.getContentText();

        if (code !== 200 && code !== 201) {
            console.error("Wix API Error:", text);
        }

        return { code, body: text };
    },


    /**
     * Creates a new contact in the Wix CMS
     * Constructs contact data with name, email, phone, and custom labels
     * Email is required; other fields are optional
     * 
     * @static
     * @param {string} firstName - Contact's first name
     * @param {string} lastName - Contact's last name
     * @param {string} email - Contact's email address (required for creation)
     * @param {string} phone - Contact's phone number (optional)
     * @param {array} labels - Array of normalized label keys for categorization (optional)
     * @returns {object} - API response object with {code: responseCode, body: responseText}
     */
    createContact: function(name, email, phone, labels) {
        if (!email) return;

        const splitName = WixUtils.splitName(name);
        const payload = {
            info: {
                name: { first: splitName.first, last: splitName.last },
                emails: {
                    items: [{ tag: "MAIN", email: email }]
                }
            },
            allowDuplicates: false
        };

        if (phone) {
            payload.info.phones = {
                items: [{ tag: "MOBILE", phone: phone }]
            };
        }

        if (labels && labels.length) {
            payload.info.labelKeys = {
                items: labels.filter(Boolean)
            };
        }

        return this.wixPost("/contacts/v4/contacts", payload);
    },
    
    /**
     * Updates an existing contact in the Wix CMS
     * Re-structures payload according to the Wix Contacts V4 PATCH API
     * @param {object} contact - The current contact entity containing 'id' and 'revision'
     * @param {string} name - Contact's full name to be split and updated
     * @param {string} email - Contact's main email address
     * @param {string} phone - Contact's mobile phone number 
     * @param {array} labels - Array of normalized label keys for categorization
     * @returns {object} - API response object with {code: responseCode, body: responseText}
     */
    updateContact: function(contact, name, email, phone, labels) {
        if (!contact || !contact.id) return;

        const contactId = contact.id;
        
        const payload = {
            revision: contact.revision,
            info: {}
        };

        if (name) {
            const splitName = WixUtils.splitName(name);
            payload.info.name = { first: splitName.first, last: splitName.last };
        }

        if (email) {
            payload.info.emails = {
                items: [{ tag: "MAIN", email: email }]
            };
        }

        if (phone) {
            payload.info.phones = {
                items: [{ tag: "MOBILE", phone: phone }]
            };
        }

        if (labels && labels.length) {
            payload.info.labelKeys = {
                items: labels.filter(Boolean)
            };
        }

        return this.wixPatch(`/contacts/v4/contacts/${contactId}`, payload);
    },

    /**
     * Queries the Wix CMS for a contact by name, email, or phone
     * @param {string} name - Contact's full name
     * @param {string} email - Contact's main email address
     * @param {string} phone - Contact's mobile phone number
     * @returns {object|null} - The found contact or null if not found
     */
    queryContact: function(name, email, phone) { 
        const executeQuery = (filter) => {
            const payload = {
                query: {
                    filter: filter,
                    fieldsets: ["FULL"]
                }
            };

            const response = this.wixPost("/contacts/v4/contacts/query", payload);

            if (response.code !== 200) {
                console.error("Failed to query contact:", response.body);
                return null;
            }

            const contacts = JSON.parse(response.body).contacts;
            
            if (contacts && contacts.length > 0) {
                return contacts[0];
            }
            
            return null;
        };

        if (name) {
            const splitName = WixUtils.splitName(name);
            const filter = {
                "info.name.first": splitName.first,
                "info.name.last": splitName.last
            };
            const contact = executeQuery(filter);
            if (contact) return contact;
        }

        if (email) {
            const filter = { "info.emails.email": email };
            const contact = executeQuery(filter);
            if (contact) return contact;
        }

        if (phone) {
            const filter = { "info.phones.phone": phone };
            const contact = executeQuery(filter);
            if (contact) return contact;
        }

        return null;
    },

    /**
     * Queries all contacts in the Wix CMS
     * @returns {Array|null} - An array of all contacts or null if the query fails
     */
    queryAllContacts: function() {
        let allItems = [];
        let offset = 0;
        let hasNext = true;

        while (hasNext) {
            const payload = {
                fieldsets: ["FULL"],
                query: {
                    paging: {
                        limit: 100
                    }
                }
            };

            if (offset) {
                payload.query.paging.offset = offset;
            }

            const response = WixService.wixPost("/contacts/v4/contacts/query", payload);

            if (response.code !== 200) {
                console.error("Failed to query Members:", response.body);
                return null;
            }

            const data = JSON.parse(response.body);

            const items = data.contacts || [];
            allItems = allItems.concat(items);

            const paging = data.pagingMetadata;

            hasNext = paging?.hasNext === true;
            offset += paging?.count || 0;
        }

        return allItems || null;
    },

    /**
     * Subscribes a contact to the newsletter
     * @param {string} email - The email address of the contact to subscribe
     * @returns {object} - The response from the Wix API
     */
    subscribeContact: function(email) {
        if (!email) return; 

        const payload = {
            subscription: {
                email: email,
                deliverabilityStatus: "VALID",
                subscriptionStatus: "SUBSCRIBED"
            }
        };

        return this.wixPost("/email-marketing/v1/email-subscriptions", payload);
    }
};
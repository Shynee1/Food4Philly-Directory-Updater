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
        const info = {
            name: { first: splitName.first, last: splitName.last },
            emails: {
                items: [{ tag: "MAIN", email: email }]
            }
        };

        if (phone) {
            info.phones = {
                items: [{ tag: "MOBILE", phone: phone }]
            };
        }

        if (labels && labels.length) {
            info.labelKeys = {
                items: labels.filter(Boolean)
            };
        }

        return this.wixPost("/contacts/v4/contacts", { info });
    },

    queryContact: function(name, email, phone) {
        const splitName = WixUtils.splitName(name);
        const payload = {
            query: {
                filter: {
                    "info.name.first": splitName.first,
                    "info.name.last": splitName.last,
                    "info.emails.email": email,
                    "info.phones.phone": phone
                },
                fieldsets: ["FULL"]
            }
        };

        const response = this.wixPost("/contacts/v4/contacts/query", payload);

        if (response.code !== 200) {
            console.error("Failed to query contact:", response.body);
            return null;
        }

        const contacts = JSON.parse(response.body).contacts;

        if (!contacts || contacts.length === 0) {
            return null;
        }

        return contacts[0];
    },

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

    queryMember: function(name, email, phone) {
        const payload = {
            dataCollectionId: "Members",
            query: {
                filter: {
                    "name": name,
                    "phone": phone,
                    "email": email
                }
            }
        };
        
        const response = this.wixPost("/wix-data/v2/items/query", payload);

        if (response.code !== 200) {
            console.error("Failed to query Member:", response.body);
            return null;
        }

        const dataItems = JSON.parse(response.body).dataItems;
        if (!dataItems || dataItems.length === 0) {
            return null;
        }
        return dataItems[0];
    },

    queryAllMembers: function() {
        let allItems = [];
        let cursor = null;
        let hasNext = true;

        while (hasNext) {
            const payload = {
                dataCollectionId: "Members",
                query: {
                    cursorPaging: {
                        limit: 100
                    }
                }
            };

            if (cursor) {
                payload.query.cursorPaging.cursor = cursor;
            }

            const response = WixService.wixPost("/wix-data/v2/items/query", payload);

            if (response.code !== 200) {
                console.error("Failed to query Members:", response.body);
                return null;
            }

            const data = JSON.parse(response.body);

            const items = data.dataItems || [];
            allItems = allItems.concat(items);

            const paging = data.pagingMetadata;

            hasNext = paging?.hasNext === true;
            cursor = paging?.cursors?.next || null;
        }

        return allItems || null;
    }
};
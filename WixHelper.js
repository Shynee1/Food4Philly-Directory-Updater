/**
 * Service class for interacting with the Wix API
 * Manages OAuth2 authentication and contact management for the Wix CMS
 * Handles token caching to minimize API calls and improve performance
 */
class WixService {
  /**
   * Obtains a valid OAuth2 access token for Wix API authentication
   * Caches the token and reuses it until expiration, reducing unnecessary API calls
   * Retrieves credentials from Google Apps Script properties
   * 
   * @static
   * @returns {string} - Valid access token for Wix API requests
   * @throws {Error} - If token retrieval fails or API returns an error
   */
  static getAccessToken() {
    const now = Date.now();

    if (
      WixService.accessToken &&
      now < WixService.accessTokenExpiryTime - 60000
    ) {
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

    WixService.accessToken = data.access_token;
    WixService.accessTokenExpiryTime =
      now + (data.expires_in * 1000);

    return WixService.accessToken;
  }

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
  static wixPost(endpoint, payload) {
    const token = WixService.getAccessToken();

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
  }

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
  static createContact(firstName, lastName, email, phone, labels) {
    if (!email) return;

    const info = {
      name: { first: firstName, last: lastName },
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

    return WixService.wixPost("/contacts/v4/contacts", { info });
  }
}

// Get around some google nonsense
WixService.accessToken = "";
WixService.accessTokenExpiryTime = 0;

/**
 * Splits a full name into first and last name components
 * Handles single names by returning the full string as first name with empty last name
 * Removes excess whitespace and normalizes name formatting
 * Example: "John Smith Jr." --> {first: "John", last: "Smith Jr."}
 * 
 * @param {string} fullName - The complete name to split
 * @returns {object} - Object with {first: firstName, last: lastName}
 */
function splitName(fullName) {
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
}

/**
 * Converts a label string into a normalized custom field key for Wix API
 * Removes special characters, converts to camelCase, and prefixes with "custom."
 * Ensures the output is compatible with Wix's custom field naming requirements
 * Example: "Chapter Head" --> "custom.chapterHead"
 * 
 * @param {string} label - The raw label text to normalize
 * @returns {string|null} - The normalized label as "custom.camelCaseLabel" or null if input is falsy
 */
function normalizeLabel(label) {
  if (!label) return null;

  label = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_ ]+/g, "")
    .replace(/\s+(\w)/g, (match, char) => char.toUpperCase());

  return "custom." + label;
}

/**
 * Checks if a title string contains the "Chapter Head" designation
 * Useful for identifying leadership roles in member data
 * Performs case-insensitive matching and handles comma-separated titles
 * Example: "Strategy, Chapter Head" --> true
 * 
 * @param {string} title - The title string to search
 * @returns {boolean} - True if "chapter head" is found, false otherwise
 */
function hasChapterHead(title) {
  if (!title) return false;

  return title
    .split(",")
    .some(part => part.trim().toLowerCase().includes("chapter head"));
}

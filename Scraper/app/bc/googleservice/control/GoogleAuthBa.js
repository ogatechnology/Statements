const {google} = require('googleapis');

async function getAuthClient() {
// environment variables.
// This method looks for the GCLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS
    const authClient = await google.auth.getClient({
        // Scopes can be specified either as an array or as a single, space-delimited string.
        scopes: [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/compute',
        ]
    });
    await authClient.authorize();
    return authClient;
}

module.exports = {getAuthClient};
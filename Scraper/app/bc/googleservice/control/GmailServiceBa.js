const {google} = require('googleapis');
const googleAuthBa = require('./GoogleAuthBa');
const compute = google.compute('v1');

async function getLabels() {
    const gmail = await _getGmail();

    // obtain the current project Id
    const project = await google.auth.getProjectId();

    // Fetch the list of GCE zones within a project.
    const res = await compute.zones.list({ project, auth });
    console.log(res.data);

    return gmail.users.messages.list({
        userId: 'joseph@okharedia.com'
    });
}

async function _getGmail() {
    const authClient = await googleAuthBa.getAuthClient();
    await authClient.authorize();
    return google.gmail({
        version: 'v1',
        auth: authClient,
    });
}

module.exports = {getLabels};
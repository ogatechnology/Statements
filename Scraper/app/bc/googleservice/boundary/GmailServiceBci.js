const gmailServiceBa = require('../control/GmailServiceBa');

function getLabels() {
    return gmailServiceBa.getLabels();
}

module.exports = {getLabels};
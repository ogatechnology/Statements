const gmailServiceBa = require('../control/GmailServiceBa');

function getLabels() {
    return gmailServiceBa.getLabels();
}

function findLabelByName(name) {
    return gmailServiceBa.findLabelByName(name);
}

module.exports = {getLabels, findLabelByName};
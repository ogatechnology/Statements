const gmailServiceBa = require('../control/GmailServiceBa');

function findAttachmentsByLabel$(labelName, fromDate, toDate) {
    return gmailServiceBa.findAttachmentsByLabel$(labelName, fromDate, toDate);
}

module.exports = {findAttachmentsByLabel$};
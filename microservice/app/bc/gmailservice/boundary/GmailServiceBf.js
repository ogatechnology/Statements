const gmailServiceBa = require('../control/GmailServiceBa');

function findAttachmentsByLabel$(labelName) {
    return gmailServiceBa.findAttachmentsByLabel$(labelName);
}

module.exports = {findAttachmentsByLabel$};
const attachmentParserBa = require('../control/AttachmentParserBa');

function createStatementFromAttachment(attachment) {
    attachmentParserBa.createStatement(attachment);
}

module.exports = {createStatementFromAttachment};
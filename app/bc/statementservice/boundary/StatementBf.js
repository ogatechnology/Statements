const statementBa = require('../control/StatementBa');

function createStatementFromAttachment$(attachment) {
    return statementBa.createStatement$(attachment);
}

module.exports = {createStatementFromAttachment$};
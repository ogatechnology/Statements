const elasticSearchBa = require('../control/ElasticSearchBa');

function saveStatement(statement) {
    return elasticSearchBa.saveStatement(statement);
}


module.exports = {saveStatement};
const elasticsearch = require('elasticsearch');
const URL = process.env.APP_ELASTICSEARCH_URL || 'localhost:9200';
const client = new elasticsearch.Client({
    host: URL,
    // log: 'trace'
});
const INDEX = process.env.APP_ELASTICSEARCH_INDEX || 'transactions';
const TYPE = '_doc';

async function saveTransactions(transactions) {
    const bulkRequests = [];
    for (let transaction of transactions) {
        bulkRequests.push({"index": {"_index": INDEX, "_type": TYPE, "_id": transaction.x}});
        bulkRequests.push(JSON.stringify(transaction));
    }

    try {
        return client.bulk({
            index: INDEX, type: TYPE, refresh: true,
            body: bulkRequests
        });
    } catch (e) {
        throw `Failed to create documents ex: ${e}`;
    }
}

async function searchByIds(...ids) {
    const body = {
        "query": {
            "ids": {
                "values": ids || []
            }
        }
    };
    try {
        return client.search({index: INDEX, type: TYPE, body});
    } catch (e) {
        throw `Failed to search documents by ids:${ids} ex: ${e}`;
    }
}

module.exports = {saveTransactions, searchByIds};
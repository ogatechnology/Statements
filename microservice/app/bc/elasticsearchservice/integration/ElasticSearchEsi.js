const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: 'localhost:9200',
    // log: 'trace'
});
const INDEX = process.env.ES_INDEX || 'transactions';
const TYPE = process.env.ES_INDEX_TYPE || '_doc';

async function saveTransactions(transactions) {
    const bulkRequests = [];
    for (let transaction of transactions) {
        bulkRequests.push({"index": {"_index": INDEX, "_type": TYPE, "_id": transaction.id}});
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
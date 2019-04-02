const elasticsearch = require('elasticsearch');
const util = require('util');
const MAPPING = require('./testdata/Mapping');
const DOCUMENTS = require('./testdata/Documents');
const assert = require("assert");
const INDEX = process.env.ES_INDEX || 'transactions';
const TYPE = process.env.ES_INDEX_TYPE || '_doc';

const client = new elasticsearch.Client({
    host: 'localhost:9200',
    // log: 'trace'
});

async function ping() {
    try {
        const response = await client.ping({requestTimeout: 1000});
        assert.strictEqual(response, true);
    } catch (e) {
        throw `elasticsearch cluster is down! ex: ${e}`;
    }
}

async function deleteAllIndices() {
    try {
        const response = await client.indices.delete({index: '_all'});
        assert.strictEqual(response.acknowledged, true);
    } catch (e) {
        throw `Failed to delete all indices ex: ${e}`;
    }
}

async function createIndex() {
    try {
        const response = await client.indices.create({index: INDEX});
        assert.strictEqual(response.acknowledged, true);
    } catch (e) {
        throw `Failed to create index ${INDEX} ex: ${e}`;
    }
}

async function createMapping() {
    try {
        const response = await client.indices.putMapping({index: INDEX, type: TYPE, body: MAPPING});
        assert.strictEqual(response.acknowledged, true);
    } catch (e) {
        throw `Failed to create index ${INDEX} ex: ${e}`;
    }
}


async function addDocuments() {
    const bulkRequests = [];
    for (let document of DOCUMENTS) {
        bulkRequests.push({"index": {"_index": INDEX, "_type": TYPE, "_id": document.id}});
        bulkRequests.push(document);
    }
    try {
        const response = await client.bulk({
            index: INDEX, type: TYPE, refresh: true, _source: true,
            body: bulkRequests
        });
        assert.strictEqual(response.errors, false);
    } catch (e) {
        throw `Failed to create document ${document} ex: ${e}`;
    }
}

async function cleanData() {
    await deleteAllIndices();
    await createIndex();
    await createMapping();
}

async function installData() {
    await cleanData();
    await addDocuments();
}

module.exports = {cleanData, installData};
const moment = require('moment');
const hash = require('object-hash');
const util = require('util');
const elasticSearchEsi = require('../integration/ElasticSearchEsi');

async function saveStatement(statement) {
    validateStatement(statement);
    const transactions = createElasticSearchTransactionsFromStatement(statement);
    const {items} = await elasticSearchEsi.saveTransactions(transactions);

    const ids = items.map(i => i.index._id);
    const {hits: {hits}} = await elasticSearchEsi.searchByIds(...ids);
    return hits.map(h => h._source);
}

function createElasticSearchTransactionsFromStatement(statement) {
    const transactions = [];
    statement.transactions.forEach(t => {
        t.id = hash.sha1(t);
        const _statement = Object.assign({}, statement);
        delete _statement.transactions;
        delete _statement.attachments;
        t.statement = _statement;
        transactions.push(t);
    });
    return transactions;
}

function validateStatement(statement) {
    if (!statement) throw Error('Statement is required!');
    if (!statement['institution']) throw Error('Statement institution is required!');
    if (!statement['statementNumber']) throw Error('Statement number is required!');
    if (!statement['accountNumber']) throw Error('Statement account number is required!');
    if (!statement['accountDescription']) throw Error('Statement account description is required!');
    if (!statement['transactions']) throw Error('Statement transactions is required!');
    if (!statement['transactions'].length) throw Error('Statement transactions must be gt 0!');
    statement['transactions'].forEach(t => validateTransaction(t));
}

function validateTransaction(transaction) {
    if (!transaction) throw Error('Transaction is required!');
    if (!transaction['date']) throw Error('Transaction date is required!');
    if (!moment(transaction['date']).isValid()) throw Error(`Transaction date ${transaction['date']} is invalid!`);
    if (!transaction['description']) throw Error('Transaction description is required!');
    if (isNaN(transaction['amount'])) throw Error(`Transaction amount ${transaction['amount']} is invalid!`);
    if (isNaN(transaction['balance'])) throw Error(`Transaction balance ${transaction['balance']} is invalid!`);
}

module.exports = {saveStatement};
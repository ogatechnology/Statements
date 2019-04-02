const key = require('./key');
const express = require('express');
const moment = require('moment');
const {from} = require('rxjs');
const {mergeMap, tap} = require('rxjs/operators');
const util = require('util');
const app = express();
const PORT = process.env.APP_PORT || 3000;
const gmailService = require('./bc/gmailservice/boundary/GmailServiceBf');
const statementService = require('./bc/statementservice/boundary/StatementBf');
const elasticService = require('./bc/elasticsearchservice/boundary/ElasticSearchBf');

app.get('/', (req, res) => res.send('pong'));
app.get('/statements/:label', (req, res) => {
    try {
        key.acquireLock();
    } catch (e) {
        res.send(`scraping was last run ${e.message} and might still be in process. Please try again later.`);
        return;
    }


    const label = req.params['label'];
    res.send(moment());
    console.log(`Retrieving statement in label:${label}`);
    const startTime = moment();
    let countStatements = 0;
    let countTransactions = 0;
    gmailService.findAttachmentsByLabel$(label).pipe(
        tap(() => countStatements++),
        mergeMap(att => statementService.createStatementFromAttachment$(att)),
        tap((stmt) => countTransactions += stmt.transactions.length),
        mergeMap(stmt => from(elasticService.saveStatement(stmt))))
        .subscribe
        (
            (transactions) => {
            },
            (e) => console.error(`Error scraping statements in label:${label} ex:${e}`, e),
            () => {
                console.log(`Imported ${countStatements} statements and ${countTransactions} transactions`);
                console.log(`Finished scraping for label ${label} in ${moment().diff(startTime, 'seconds')} seconds`)
            }
        );

});

app.listen(PORT, () => console.log(`ukubeka listening on port ${PORT}!`));



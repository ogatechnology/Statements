const lock = require('./Lock');
const express = require('express');
const moment = require('moment/moment');
const url = require('url');
const {from} = require('rxjs/index');
const {mergeMap, tap} = require('rxjs/operators/index');
const util = require('util');
const PORT = process.env.APP_SERVER_PORT || 3000;
const gmailService = require('./bc/gmailservice/boundary/GmailServiceBf');
const statementService = require('./bc/statementservice/boundary/StatementBf');
const elasticService = require('./bc/elasticsearchservice/boundary/ElasticSearchBf');
const app = express();


app.get('/', (req, res) => res.send('pong'));
app.get('/statements/:label', (req, res) => {
    const {query} = url.parse(req.url, true);
    const force = query['force'] !== undefined && query['force'] !== 'false' && query['force'] !== false ;
    try {
        !force && lock.acquireLock();
    } catch (e) {
        res.send(`scraping was last run ${e.message} and might still be in process. Please try again later.`);
        return;
    }


    const label = req.params['label'];
    if (query['fromDate'] && !moment(query['fromDate']).isValid()) {
        res.send(`From date is invalid at: ${moment(query['fromDate']).invalidAt()}`);
        return;
    }
    if (query['toDate'] && !moment(query['toDate']).isValid()) {
        res.send(`To date is invalid at: ${moment(query['toDate']).invalidAt()}`);
        return;
    }
    const fromDate = (query['fromDate'] && moment(query['fromDate']).toDate()) || new Date();
    const toDate = (query['toDate'] && moment(query['toDate']).toDate()) || new Date();

    console.log(`Retrieving statement in label:${label} fromDate:${fromDate}, toDate:${toDate}`);
    const startTime = moment();
    let countStatements = 0;
    let countTransactions = 0;
    gmailService.findAttachmentsByLabel$(label, fromDate, toDate).pipe(
        tap(() => countStatements++),
        mergeMap(att => statementService.createStatementFromAttachment$(att)),
        tap((stmt) => {
            console.log(`Processing statement ${stmt.statementNumber}`);
            countTransactions += stmt.transactions.length;
        }),
        mergeMap(stmt => from(elasticService.saveStatement(stmt))))
        .subscribe
        (
            () => console.log(`Counted ${countTransactions} transactions so far`),
            (e) => {
                const timeElapsed = moment().diff(startTime, 'seconds');
                console.error(`Error scraping statements in label:${label} ex:${e}`, e);
                res.status(500).send({
                    startTime,
                    endTime: moment(),
                    timeElapsed,
                    label,
                    fromDate,
                    toDate,
                    countStatements,
                    countTransactions,
                    error: e.message
                });
            },
            () => {
                const timeElapsed = moment().diff(startTime, 'seconds');
                console.log(`Imported ${countStatements} statements and ${countTransactions} transactions`);
                console.log(`Finished scraping for label ${label} in ${timeElapsed} seconds`);
                res.status(200).send({
                    startTime,
                    endTime: moment(),
                    timeElapsed,
                    label,
                    fromDate,
                    toDate,
                    countStatements,
                    countTransactions,
                });
            }
        );

});

app.listen(PORT, () => console.log(`ukubeka listening on port ${PORT}!`));



const FNBStatementTransformer = require('./statementparsers/FNBStatementTransformer');
const FNBTransactionTransformer = require('./statementparsers/FNBTransactionTransformer');
const NedbankStatementTransformer = require('./statementparsers/NedbankStatementTransformer');
const NedbankTransactionTransformer = require('./statementparsers/NedbankTransactionTransformer');
const parse = require('csv-parse');
const es = require("event-stream");
const {Observable, pipe} = require('rxjs');
const {map, tap, concatMap, concat} = require('rxjs/operators');
const FNB_REGEX = /^(2,)[0-9]+(,')[A-Za-z\s]+(',')[A-Za-z\s]+(')/;
const NEDBANK_REGEX = /^(Statement Enquiry)\s:/;
const util = require('util');

function createStatement$(attachment) {
    if (!attachment) {
        throw Error(`Attachment ${attachment} must be valid`);
    }

    const statementTransformer = attachmentToStatementTransformerFactory(attachment);
    const transactionTransformer = attachmentToTransactionTransformerFactory(attachment);

    return statementFromAttachment$(attachment, statementTransformer)
        .pipe(
            map(statement => {
                statement.attachment = attachment;
                return statement;
            }),
            concatMap(statement =>
                transactionsFromAttachment$(attachment, transactionTransformer).pipe(
                    map(transactions => {
                        statement.transactions = transactions;
                        return statement;
                    })
                )
            )
        );
}


const statementFromAttachment$ = (attachment, statementTransformer) => {
    return new Observable(observer => {
        let statement = null;

        // setup the csv parser breakup a comma separated line into an array of values
        const csvParser = parse({relax_column_count: true, ltrim: true, rtrim: true});
        csvParser.on('error', (e) => observer.error(e));

        const innerStream = es.readArray([attachment]) // read the csv into an event stream
            .pipe(es.split(/(\r?\n)/)) // break up the csv by new line
            .pipe(csvParser) // feed each line into the csv parser to get an array of values
            .pipe(statementTransformer) // feed the line values into a statement transformer that will collate the values from
            // each line and spit out a statement when complete
            .pipe(es.map((_statement, callback) => {
                statement = _statement;
                callback();
            }));

        innerStream.on('end', () => {
            if (statement == null) {
                observer.error(Error(`Failed to transform csv to statement`));
            }
            observer.next(statement);
            observer.complete();
        });

        innerStream.on('error', (e) => {
            observer.error(e);
        })
    });
};


const transactionsFromAttachment$ = (attachment, transactionTransformer) => {
    return new Observable(observer => {
        const transactions = []; // array to hold all transactions produced from the statement

        // setup the csv parser breakup a comma separated line into an array of values
        const csvParser = parse({relax_column_count: true, ltrim: true, rtrim: true});
        csvParser.on('error', (e) => observer.error(e));

        const innerStream = es.readArray([attachment]) // read the csv into an event stream
            .pipe(es.split(/(\r?\n)/)) // break up the csv by new line
            .pipe(csvParser) // feed each line into the csv parser to get an array of values
            .pipe(transactionTransformer) // feed the line values into a transaction transformer that will collate the values from
            // each line and spit out a transaction when complete
            .pipe(es.map((_transaction, callback) => {
                transactions.push(_transaction);
                callback();
            }));

        innerStream.on('end', () => {
            if (transactions.length === 0) {
                observer.error(Error(`No Transactions created from statement`));
            }
            observer.next(transactions);
            observer.complete();
        });

        innerStream.on('error', (e) => {
            observer.error(e);
        })
    });
};

const attachmentToStatementTransformerFactory = (attachment) => {
    if (FNB_REGEX.test(attachment)) {
        return new FNBStatementTransformer();
    }

    if (NEDBANK_REGEX.test(attachment)) {
        return new NedbankStatementTransformer();
    }

    throw Error(`Attachment not supported!`);
};


const attachmentToTransactionTransformerFactory = (attachment) => {
    if (FNB_REGEX.test(attachment)) {
        return new FNBTransactionTransformer();
    }

    if (NEDBANK_REGEX.test(attachment)) {
        return new NedbankTransactionTransformer();
    }

    throw Error(`Attachment not supported!`);
};

module.exports = {createStatement$};

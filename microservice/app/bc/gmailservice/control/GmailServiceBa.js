const {mergeAll, mergeMap, expand, map, tap, concatMap, pluck, concatAll, take, filter} = require('rxjs/operators');
const GMAIL_MESSAGES_DEFAULT_CHUNK_SIZE = process.env.GMAIL_MESSAGES_DEFAULT_CHUNK_SIZE || 100;
const GMAIL_ATTACHMENT_DEFAULT_EXTENSION = 'csv';
const {listGmailResource$, getGmailResource$} = require('./GmailHelper');

function getLabels$() {
    return labels$;
}

function findLabelByName$(name) {
    return labelByName$(name);
}

function findMessagesByLabel$(labelName) {
    return messagesByLabel$(labelName);
}

function findAttachmentsByLabel$(labelName, attachmentExtension = GMAIL_ATTACHMENT_DEFAULT_EXTENSION) {
    return attachmentsByLabel$(labelName, attachmentExtension);
}

const labels$ = listGmailResource$('labels').pipe(pluck('data', 'labels'));

const labelByName$ = (name) => labels$.pipe(concatAll(), filter(l => l.name === name), take(1));

const messagesByLabel$ = (labelName, chunkSize = GMAIL_MESSAGES_DEFAULT_CHUNK_SIZE) =>
    labelByName$(labelName).pipe(
        pluck('id'),
        concatMap(labelId => {
            const __getNextPageOfMessages$ = (nextPageToken) => {
                const options = {labelIds: [labelId], maxResults: chunkSize};
                nextPageToken && Object.assign(options, {pageToken: nextPageToken});
                return listGmailResource$('messages', options);
            };
            return __getNextPageOfMessages$().pipe(
                expand(result => __getNextPageOfMessages$(result.data.nextPageToken)),
                filter(result => result.data.messages && result.data.messages.length),
                pluck('data', 'messages'),
            );
        }),
    );

const attachmentsByLabel$ = (labelName, attachmentExtension) =>
    messagesByLabel$(labelName).pipe(
        mergeAll(),
        concatMap(msg =>
            getGmailResource$('messages', {id: msg.id}).pipe(
                pluck('data', 'payload', 'parts'),
                mergeAll(),
                filter(part => !attachmentExtension || (attachmentExtension && part.filename.endsWith(attachmentExtension))),
                pluck('body', 'attachmentId'),
                mergeMap(attachmentId => getGmailResource$(['messages', 'attachments'], {
                    messageId: msg.id,
                    id: attachmentId
                })),
                pluck('data', 'data'),
                map(data => Buffer.from(data, 'base64').toString('utf8'))
            )
        ),
    );


module.exports = {getLabels$, findLabelByName$, findMessagesByLabel$, findAttachmentsByLabel$};
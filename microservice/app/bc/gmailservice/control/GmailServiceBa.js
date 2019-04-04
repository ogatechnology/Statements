const {EMPTY} = require('rxjs');
const {mergeAll, mergeMap, expand, map, tap, concatMap, pluck, concatAll, take, filter} = require('rxjs/operators');
const util = require('util');
const GMAIL_GET_MESSAGES_CHUNK_SIZE = process.env.APP_GMAIL_GET_MESSAGES_CHUNK_SIZE || 100;
const GMAIL_ATTACHMENT_EXTENSION = 'csv';
const GMAIL_DEFAULT_LABEL = 'INBOX';
const {listGmailResource$, getGmailResource$} = require('./GmailHelper');

function findAttachmentsByLabel$(labelName, attachmentExtension) {
    return attachmentsByLabel$(labelName, attachmentExtension);
}

const attachmentsByLabel$ = (labelName = GMAIL_DEFAULT_LABEL, attachmentExtension = GMAIL_ATTACHMENT_EXTENSION) =>
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

const messagesByLabel$ = (labelName, chunkSize = GMAIL_GET_MESSAGES_CHUNK_SIZE) =>
    labelByName$(labelName).pipe(
        pluck('id'),
        concatMap(labelId => {
            const __getNextPageOfMessages$ = (nextPageToken) => {
                const options = {labelIds: [labelId], maxResults: chunkSize};
                nextPageToken && Object.assign(options, {pageToken: nextPageToken});
                return listGmailResource$('messages', options);
            };
            return __getNextPageOfMessages$().pipe(
                expand(result => result.data.nextPageToken ? __getNextPageOfMessages$(result.data.nextPageToken) : EMPTY),
                pluck('data', 'messages'),
            );
        }),
    );

const labelByName$ = (name) => labels$.pipe(concatAll(), filter(l => l.name === name), take(1));

const labels$ = listGmailResource$('labels').pipe(pluck('data', 'labels'));

module.exports = {findAttachmentsByLabel$};
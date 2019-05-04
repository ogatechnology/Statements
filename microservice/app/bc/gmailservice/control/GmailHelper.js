const googleAuthBf = require("../../googleservice/boundary/GoogleAuthBf");
const {google} = require('googleapis/build/src/index');
const {from, of} = require('rxjs/index');
const util = require('util');
const {mergeAll, mergeMap, expand, tap, shareReplay, concatMap, pluck, concatAll, take, filter} = require('rxjs/operators/index');

const gmail$ = googleAuthBf.getAuthClient$().pipe(
    concatMap(authClient => of(google.gmail({version: 'v1', auth: authClient}))),
    shareReplay(1)
);

const listGmailResource$ = (resources = [], options = {}) => {
    if (typeof resources === 'string') {
        resources = [resources];
    }
    return gmail$.pipe(concatMap(gmail => {
        let resource = resources.reduce((finalResource, currentResource) => finalResource[currentResource], gmail.users);
        return from(resource.list({userId: 'me', ...options}))
    }));
};

const getGmailResource$ = (resources = [], options = {}) => {
    if (typeof resources === 'string') {
        resources = [resources];
    }
    return gmail$.pipe(concatMap(gmail => {
        let resource = resources.reduce((finalResource, currentResource) => finalResource[currentResource], gmail.users);
        return from(resource.get({userId: 'me', ...options}))
    }));
};

module.exports = {listGmailResource$, getGmailResource$};
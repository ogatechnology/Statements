const {google} = require('googleapis');
const {of,from} = require('rxjs');
const {shareReplay, concatMap} = require('rxjs/operators');


function getAuthClient$() {
    return authClient$;
}


const authClient$ = from(google.auth.getClient({
    scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
    ]
})).pipe(
    concatMap(authClient => {
        authClient.subject = process.env.GOOGLE_AUTH_IMPERSONATE || 'joseph@okharedia.com';
        return of(authClient);
    }),
    shareReplay(1)
);


module.exports = {getAuthClient$};
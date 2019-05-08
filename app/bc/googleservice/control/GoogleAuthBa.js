const {google} = require('googleapis/build/src/index');
const {of,from} = require('rxjs/index');
const {shareReplay, concatMap} = require('rxjs/operators/index');
const GOOGLE_AUTHORIZED_EMAIL_ADDRESS = process.env.APP_GOOGLE_AUTHORIZED_EMAIL_ADDRESS;


function getAuthClient$() {
    return authClient$;
}


const authClient$ = from(google.auth.getClient({
    scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
    ]
})).pipe(
    concatMap(authClient => {
        authClient.subject = GOOGLE_AUTHORIZED_EMAIL_ADDRESS;
        return of(authClient);
    }),
    shareReplay(1)
);


module.exports = {getAuthClient$};
const fs = require('fs');
const moment = require('moment');
const LOCK_FILE_NAME = process.env.APP_LOCK_FILE_NAME || 'runInfo.lock';
const MAX_RUN_TIME_IN_SECONDS = process.env.MAX_RUN_TIME_IN_SECONDS || 60;

function acquireLock() {
    if (fs.existsSync(LOCK_FILE_NAME)) {
        const {lastRun} = JSON.parse(fs.readFileSync(LOCK_FILE_NAME, {encoding: 'utf8'}));
        console.log(`lastRun: ${lastRun}`);
        if (moment().diff(moment(lastRun), 'seconds') > MAX_RUN_TIME_IN_SECONDS) {
            _unlock();
        }else {
            throw new Error(lastRun);
        }
    }
    _lock();
}

function _lock() {
    fs.writeFileSync(LOCK_FILE_NAME, JSON.stringify({lastRun: moment().format()}));
}

function _unlock() {
    fs.unlinkSync(LOCK_FILE_NAME);
}

module.exports = {acquireLock};
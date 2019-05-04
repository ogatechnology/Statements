const fs = require('fs');
const moment = require('moment/moment');
const RUN_LOCK_FILE = 'run.lock';
const WAITING_PERIOD_BEFORE_NEXT_RUN_IN_SECONDS = process.env.APP_WAITING_PERIOD_BEFORE_NEXT_RUN_IN_SECONDS || 120;

function acquireLock() {
    if (fs.existsSync(RUN_LOCK_FILE)) {
        const {lastRun} = JSON.parse(fs.readFileSync(RUN_LOCK_FILE, {encoding: 'utf8'}));
        console.log(`lastRun: ${lastRun}`);
        if (moment().diff(moment(lastRun), 'seconds') > WAITING_PERIOD_BEFORE_NEXT_RUN_IN_SECONDS) {
            _unlock();
        }else {
            throw new Error(lastRun);
        }
    }
    _lock();
}

function _lock() {
    fs.writeFileSync(RUN_LOCK_FILE, JSON.stringify({lastRun: moment().format()}));
}

function _unlock() {
    fs.unlinkSync(RUN_LOCK_FILE);
}

module.exports = {acquireLock};
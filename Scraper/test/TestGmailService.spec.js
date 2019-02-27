const {expect, assert} = require('chai');
const util = require('util');
const gmailServiceBa = require('../app/bc/googleservice/control/GmailServiceBa');

describe('Get Gmail labels', function () {

    it('should get gmail labels successfully', async function () {
        try {
            console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);
            const labels = await gmailServiceBa.getLabels();
            console.log(labels);
        }catch (e) {
            console.error(util.inspect(e));
        }
    });

});
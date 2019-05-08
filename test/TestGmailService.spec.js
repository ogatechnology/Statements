const gmailServiceBa = require("../app/bc/gmailservice/control/GmailServiceBa");
const {expect} = require('chai');
const {take} = require('rxjs/operators/index');
const util = require('util');
const moment = require('moment/moment');

describe('Get Gmail labels', function () {

    // it('should get gmail labels successfully', function (done) {
    //     let labels;
    //     gmailServiceBa.getLabels$().subscribe(
    //         lbs => labels = lbs,
    //         err => {
    //             console.error(err);
    //             done(new Error('Failed to get gmail labels'));
    //         },
    //         () => {
    //             expect(labels).to.be.an('array').that.is.not.empty;
    //             done();
    //         }
    //     );
    //
    // });

    // it('should find a specific gmail label successfully', function (done) {
    //     const nameToFind = 'UNREAD';
    //     let label;
    //     gmailServiceBa.findLabelByName$(nameToFind).subscribe(
    //         lbl => label = lbl,
    //         err => {
    //             console.error(err);
    //             done(new Error(`Failed to find specific gmail label`));
    //         },
    //         () => {
    //             expect(label['name']).to.eql(nameToFind);
    //             expect(label['id']).not.to.be.null;
    //             done();
    //         }
    //     );
    // });

    // it('should find messages for a specific gmail label successfully', function (done) {
    //     const labelName = 'UNREAD';
    //     let messages = [];
    //     gmailServiceBa.findMessagesByLabel$(labelName).pipe(take(2)).subscribe(
    //         msg => messages.push(msg),
    //         err => {
    //             console.error(err);
    //             done(new Error(`Failed to find messages for a specific gmail label`));
    //         },
    //         () => {
    //             console.log(`Messages: ${util.inspect(messages)}`);
    //             expect(messages).to.be.an('array').that.is.not.empty;
    //             done();
    //         }
    //     );
    // });

    it('should find all attachments for messages with in a specific label successfully', function (done) {
        const labelName = 'FNB Cheque Statements';
        let attachments = [];
        const fromDate = moment.utc('2018-01-01').toDate();
        const toDate = moment.utc('2019-01-01').toDate();
        gmailServiceBa.findAttachmentsByLabel$(labelName, fromDate, toDate).pipe(take(2)).subscribe(
            msg => attachments.push(msg),
            err => {
                console.error(err);
                done(new Error(`Failed to find attachments for a specific gmail label`));
            },
            () => {
                console.log(`Attachments: ${util.inspect(attachments)}`);
                expect(attachments).to.be.an('array').that.is.not.empty;
                done();
            }
        );
    });
    it('should not find any attachments for messages with in a specific label successfully', function (done) {
        const labelName = 'FNB Cheque Statements';
        let attachments = [];
        const fromDate = moment.utc().add(1, 'day');
        const toDate = moment.utc().add(1, 'day');
        gmailServiceBa.findAttachmentsByLabel$(labelName, fromDate, toDate).pipe(take(2)).subscribe(
            msg => attachments.push(msg),
            err => {
                console.error(err);
                done(new Error(`Failed to find attachments for a specific gmail label`));
            },
            () => {
                console.log(`Attachments: ${util.inspect(attachments)}`);
                expect(attachments).to.be.empty;
                done();
            }
        );
    })

});
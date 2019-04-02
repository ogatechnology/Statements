const gmailServiceBa = require("../app/bc/gmailservice/control/GmailServiceBa");
const {expect} = require('chai');
const {take} = require('rxjs/operators');
const util = require('util');

describe('Get Gmail labels', function () {

    it('should get gmail labels successfully', function (done) {
        let labels;
        gmailServiceBa.getLabels$().subscribe(
            lbs => labels = lbs,
            err => {
                console.error(err);
                done(new Error('Failed to get gmail labels'));
            },
            () => {
                expect(labels).to.be.an('array').that.is.not.empty;
                done();
            }
        );

    });

    it('should find a specific gmail label successfully', function (done) {
        const nameToFind = 'UNREAD';
        let label;
        gmailServiceBa.findLabelByName$(nameToFind).subscribe(
            lbl => label = lbl,
            err => {
                console.error(err);
                done(new Error(`Failed to find specific gmail label`));
            },
            () => {
                expect(label['name']).to.eql(nameToFind);
                expect(label['id']).not.to.be.null;
                done();
            }
        );
    });

    it('should find messages for a specific gmail label successfully', function (done) {
        const labelName = 'UNREAD';
        let messages = [];
        gmailServiceBa.findMessagesByLabel$(labelName).pipe(take(2)).subscribe(
            msg => messages.push(msg),
            err => {
                console.error(err);
                done(new Error(`Failed to find messages for a specific gmail label`));
            },
            () => {
                console.log(`Messages: ${util.inspect(messages)}`);
                expect(messages).to.be.an('array').that.is.not.empty;
                done();
            }
        );
    });

    it('should find all attachments for messages with in a specific label successfully', function (done) {
        const labelName = 'FNB Cheque Statements';
        let attachments = [];
        gmailServiceBa.findAttachmentsByLabel$(labelName).pipe(take(2)).subscribe(
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
    })

});
const statementBa = require("../app/bc/statementservice/control/StatementBa");
const {expect} = require('chai');
const fs = require('fs');
const path = require('path');

describe('Create statement from attachment', function () {

    it('should create FNB statement from attachment successfully', function (done) {
        let statement;
        fs.readFile(path.join(__dirname, 'resources', 'FNB-Statement.csv'), {encoding: 'utf8'}, (err, data) => {

            statementBa.createStatement$(data).subscribe(
                (stmt) => statement = stmt,
                (err) => {
                    console.error(err);
                    done(Error(`Failed to create FNB statement from attachment`));
                },
                () => {
                    console.log(statement);
                    expect(statement).not.to.be.null;
                    expect(statement).to.have.property('accountNumber', '62295306578');
                    expect(statement).to.have.property('accountDescription', '\'FNB PREMIER CHEQUE ACCOUNT\'');
                    expect(statement).to.have.property('attachment', data);
                    expect(statement).to.have.property('statementNumber', '92');
                    expect(statement).to.have.property('institution', 'FNB');
                    expect(statement).to.have.property('transactions');
                    expect(statement.transactions).to.have.lengthOf(24);
                    done();
                }
            );
        });
    });

    it('should create Nedbank statement from attachment successfully', function (done) {
        let statement;
        fs.readFile(path.join(__dirname, 'resources', 'Nedbank-Statement.csv'), {encoding: 'utf8'}, (err, data) => {

            statementBa.createStatement$(data).subscribe(
                (stmt) => statement = stmt,
                (err) => {
                    console.error(err);
                    done(Error(`Failed to create Nedbank statement from attachment`));
                },
                () => {
                    console.log(statement);
                    expect(statement).not.to.be.null;
                    expect(statement).to.have.property('accountNumber', '1140197096');
                    expect(statement).to.have.property('accountDescription', 'current account');
                    expect(statement).to.have.property('attachment', data);
                    expect(statement).to.have.property('statementNumber', '97');
                    expect(statement).to.have.property('institution', 'NEDBANK');
                    expect(statement).to.have.property('transactions');
                    expect(statement.transactions).to.have.lengthOf(8);
                    done();
                }
            );
        });
    })
});
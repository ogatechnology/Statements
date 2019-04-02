const {expect} = require('chai');
const elasticSearchBa = require('../app/bc/elasticsearchservice/control/ElasticSearchBa');
const setup = require('./elasticsearch/Setup');


beforeEach(async function () {
    await setup.cleanData();
});

describe('Upload statement to elasticsearch', function () {

    it('should upload statement to elasticsearch successfully', async function () {
        const statement = {
            institution: 'FNB',
            statementNumber: 'stmtno1',
            accountNumber: 'actno1',
            accountDescription: 'actdesc1',
            attachment: 'attach1',
            transactions: [
                {
                    date: '2018-01-01',
                    description: 'txdesc1',
                    amount: 0.50,
                    balance: 99.50
                },
                {
                    date: '2018-01-02',
                    description: 'txdesc2',
                    amount: 1.50,
                    balance: 98.00
                },
            ]
        };

        const transactions = await elasticSearchBa.saveStatement(statement);
        expect(transactions).to.be.an('array').that.is.not.empty;
        expect(transactions.map(t => t.date)).to.include.members(['2018-01-01', '2018-01-02']);
        expect(transactions.map(t => t.description)).to.include.members(['txdesc1', 'txdesc2']);
        expect(transactions.map(t => t.amount)).to.include.members([0.50, 1.50]);
        expect(transactions.map(t => t.balance)).to.include.members([99.50, 98.00]);
        transactions.forEach(t => {
            expect(t).to.have.property('statement');
            expect(t.statement).to.have.property('institution', 'FNB');
            expect(t.statement).to.have.property('statementNumber', 'stmtno1');
            expect(t.statement).to.have.property('accountNumber', 'actno1');
            expect(t.statement).to.have.property('accountDescription', 'actdesc1');
        })
    });
});

describe('Upload statement with dupilcate transaction', function () {

    it('should upload statement with duplicate transactions to elasticsearch successfully', async function () {
        const statement = {
            institution: 'FNB',
            statementNumber: 'stmtno1',
            accountNumber: 'actno1',
            accountDescription: 'actdesc1',
            attachment: 'attach1',
            transactions: [
                {
                    date: '2018-01-01',
                    description: 'txdesc1',
                    amount: 0.50,
                    balance: 99.50
                },
                {
                    date: '2018-01-01',
                    description: 'txdesc1',
                    amount: 0.50,
                    balance: 99.50
                },
            ]
        };

        const transactions = await elasticSearchBa.saveStatement(statement);
        expect(transactions).to.be.an('array').that.is.not.empty;
        expect(transactions).to.have.lengthOf(1);
        expect(transactions.map(t => t.date)).to.include.members(['2018-01-01']);
        expect(transactions.map(t => t.description)).to.include.members(['txdesc1']);
        expect(transactions.map(t => t.amount)).to.include.members([0.50]);
        expect(transactions.map(t => t.balance)).to.include.members([99.50]);
        transactions.forEach(t => {
            expect(t).to.have.property('statement');
            expect(t.statement).to.have.property('institution', 'FNB');
            expect(t.statement).to.have.property('statementNumber', 'stmtno1');
            expect(t.statement).to.have.property('accountNumber', 'actno1');
            expect(t.statement).to.have.property('accountDescription', 'actdesc1');
        })
    });
});

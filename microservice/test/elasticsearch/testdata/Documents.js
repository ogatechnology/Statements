module.exports = [
    {
        "id": 1,
        "date": "2019-01-01",
        "description": "Test description 1",
        "amount": 100.00,
        "balance": 999.99,
        "statement": {
            "institution": "FNB",
            "statementNumber": "00",
            "accountNumber": "999",
            "accountDescription": "Test account 1"
        }
    },
    {
        "id": 2,
        "date": "2019-01-02",
        "description": "Test description 2",
        "amount": 101.00,
        "balance": 998.99,
        "statement": {
            "institution": "FNB",
            "statementNumber": "00",
            "accountNumber": "999",
            "accountDescription": "Test account 1"
        }
    },
    {
        "id": 3,
        "date": "2019-01-03",
        "description": "Test description 3",
        "amount": 102.00,
        "balance": 997.99,
        "statement": {
            "institution": "NEDBANK",
            "statementNumber": "11",
            "accountNumber": "888",
            "accountDescription": "Test account 2"
        }
    }

];

// {
//     "_index" : "test_transactions",
//     "_type" : "_doc",
//     "_id" : "1",
//     "_version" : 1,
//     "result" : "created",
//     "_shards" : {
//     "total" : 2,
//         "successful" : 2,
//         "failed" : 0
// },
//     "_seq_no" : 0,
//     "_primary_term" : 1
// }


// {
//     "_index" : "test_transactions",
//     "_type" : "_doc",
//     "_id" : "1",
//     "_version" : 2,
//     "result" : "updated",
//     "_shards" : {
//     "total" : 2,
//         "successful" : 2,
//         "failed" : 0
// },
//     "_seq_no" : 3,
//     "_primary_term" : 1
// }

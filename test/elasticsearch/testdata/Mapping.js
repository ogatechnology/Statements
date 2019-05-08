module.exports = {
    "properties": {
        "id": {"type": "keyword"},
        "date": {"type": "date"},
        "description": {"type": "text"},
        "amount": {"type": "scaled_float", "scaling_factor": 100},
        "balance": {"type": "scaled_float", "scaling_factor": 100},
        "statement": {
            "type": "nested",
            "properties": {
                "id": {"type": "keyword"},
                "institution": {"type": "keyword"},
                "statementNumber": {"type": "keyword"},
                "accountNumber": {"type": "keyword"},
                "accountDescription": {
                    "type": "text",
                    "fields": {"raw": {"type": "keyword"}}
                },
                "attachment": {
                    "type": "text",
                    "index": "false"
                }
            }
        }
    }
};
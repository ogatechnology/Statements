**Mission**<br/>
Application to probe gmail for csv bank statement attachments and upload to elastic search

_The following environment are setup to achieve this:_

**GOOGLE_APPLICATION_CREDENTIALS**<br/>
The credentials file used to authenticate to gmail. More details here https://cloud.google.com/docs/authentication/production

**APP_SERVER_PORT**<br/>
Port on which this application server will run. Default is 3000
 
**APP_GOOGLE_AUTHORIZED_EMAIL_ADDRESS**<br/>
The authorized gmail account from which csv bank statements will be probed.<br/>
*No default. **THIS IS REQUIRED**. e.g 'myaccount@gmail.com'*

**APP_GMAIL_GET_MESSAGES_CHUNK_SIZE**<br/>
This is the used for pagination size when probing messages in gmail. Default is 100

**APP_ELASTICSEARCH_URL**<br/>
The elasticsearch URL used when uploading bank statements. Default is 'http://localhost:9200'

**APP_ELASTICSEARCH_INDEX**<br/>
The elasticsearch INDEX used when uploading bank statements. Default is 'transactions'

**APP_WAITING_PERIOD_BEFORE_NEXT_RUN_IN_SECONDS**<br/>
To prevent multiple overlapping probe operations, this application can only run next after waiting x number of seconds. Default is 120<br/>
You may bypass this using query parameter force in the url e.g /[label-name]?force

**How to use**<br/>
You may specify the gmail label(in [labelName] of the url) that will be probed for messages with bank statements. Default is 'INBOX'.

e.g http://[host]:[port]/[labelName]<br/>
e.g http://localhost:3000/FNB-Bank-Statements

You may use force to bypass the waiting period<br/>
e.g http://localhost:3000/FNB-Bank-Statements?force
const googleAuthBa = require("../control/GoogleAuthBa");

function getAuthClient() {
    return googleAuthBa.getAuthClient();
}

module.exports = {getAuthClient};
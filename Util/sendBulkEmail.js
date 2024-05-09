const axios = require('axios');

exports.sendBulkEmail = (option) => {
    return new Promise((resolve, reject) => {
        const object = {
            method: "POST",
            url: `https://api.brevo.com/v3/smtp/email`,
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": option.apiKey
            },
            data: {
                "sender": {
                    "name": option.senderName,
                    "email": option.senderEmail
                },
                "to": option.users,
                "subject": option.emailSubject,
                "htmlContent": option.emailHTML
            }
        };
        axios
            .request(object)
            .then((response) => {
                resolve(response.data);
                // bunnyResopnse = response;
            })
            .catch((error) => {
                reject(error);
            });
    })
}
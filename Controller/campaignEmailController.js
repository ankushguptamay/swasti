const db = require('../Models');
const { Op } = require("sequelize");
const { sendCampaignEmail, addCampaignEmailCredentials } = require("../Middleware/Validate/validateMaster");
const { sendBulkEmail } = require("../Util/sendBulkEmail");
const CampaignEmail = db.campaignEmail;
const CampaignEmailCredential = db.campaignEmailCredential;

exports.sendCampaignEmail = async (req, res) => {
    try {
        // const users =  [
        //     {
        //         "email": "ankush@gmail.com",
        //         "name": "Ankush Gupta"
        //     },
        //     {
        //         "email": "ankshiv@gmail.com",
        //         "name": "Ankush Shivhare"
        //     }
        // ]
        // Validate Body
        const { error } = sendCampaignEmail(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { users } = req.body;
        // Update emailSend :0 at every new day
        const date = JSON.stringify(new Date());
        const todayDate = `${date.slice(1, 11)}`;
        await CampaignEmailCredential.update({
            emailSend: 0
        }, {
            where: {
                updatedAt: { [Op.lt]: todayDate }
            }
        });
        // Find All emails
        const findAllCampaignEmail = await CampaignEmailCredential.findAll();
        // Number of email can be sent
        let emailCanSend = 0;
        for (let i = 0; i < findAllCampaignEmail.length; i++) {
            emailCanSend = emailCanSend + (300 - parseInt(findAllCampaignEmail[i].emailSend));
        }
        if (users.length > emailCanSend) {
            return res.status(400).send({
                success: false,
                message: `Only ${emailCanSend} email can send today! You are sending ${users.length} users details!`,
            });
        }
        // finalise email credentiel
        const finaliseEmailCredential = [];
        for (let i = 0; i < findAllCampaignEmail.length; i++) {
            if (parseInt(findAllCampaignEmail[i].emailSend) < 300) {
                finaliseEmailCredential.push(findAllCampaignEmail[i]);
            }
        }
        // Send Email
        let count1 = 0;
        let count2 = 0;
        for (let i = 0; i < finaliseEmailCredential.length; i++) {
            const emailCanBeSend = 300 - parseInt(finaliseEmailCredential[i].emailSend);
            count2 = count2 + emailCanBeSend;
            const userData = [];
            for (j = count1; j < count2; j++) {
                if (users[j]) {
                    userData.push(users[j]);
                }
            }
            const option = {
                senderName: "Swasti",
                senderEmail: finaliseEmailCredential[i].email,
                emailSubject: "Information",
                emailHTML: `<p  style="font-size: 14px; text-align: center; color: #666;">Powered by Your Company | Address | Contact Information</p>`,
                users: userData,
                apiKey: finaliseEmailCredential[i].EMAIL_API_KEY
            }
            await sendBulkEmail(option);
            // update CampaignEmailCredential
            const emailSend = parseInt(finaliseEmailCredential[i].emailSend) + userData.length;
            await CampaignEmailCredential.update({
                emailSend: emailSend
            }, { where: { id: finaliseEmailCredential[i].id } });
            // store in database
            await CampaignEmail.bulkCreate(userData, { returning: true });
            count1 = count2;
            if (count1 >= users.length) {
                break;
            }
        }
        res.status(200).send({
            success: true,
            message: `Bulk Email sent successfully!`,
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.addCampaignEmailCredentials = async (req, res) => {
    try {
        // Validate Body
        const { error } = addCampaignEmailCredentials(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { apiKey, email } = req.body;
        // Find In database
        const credentials = await CampaignEmailCredential.findOne({ where: { email: email } });
        if (credentials) {
            return res.status(400).send({
                success: false,
                message: `Credentials already exist!`,
            });
        }
        await CampaignEmailCredential.create({
            email: email,
            EMAIL_API_KEY: apiKey,
            plateForm: "BREVO"
        });
        res.status(200).send({
            success: true,
            message: `Email credentials added successfully!`,
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};
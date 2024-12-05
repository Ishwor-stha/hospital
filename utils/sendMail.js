const axios = require("axios");
const errorHandling = require("../utils/errorHandling");

module.exports = async (next, message, subject, email, name) => {
    // MailerSend API endpoint
    const url = 'https://api.mailersend.com/v1/email';

    //  API key
    const API_KEY = process.env.API_KEY;

    // Email details
    const emailData = {
        from: {
            email: process.env.mailer_send_test_mail,  
            name: process.env.mail_name               
        },
        to: [
            {
                email: email,  // Recipient email
                name: name      // Recipient name
            }
        ],
        subject: subject,  // Subject of the email
        text: message      // Body of the email
    };

    // Function to send an email
    try {
        const response = await axios.post(url, emailData, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 202) {
            console.log('Email sent successfully!');
        } else {
            console.log(`Unexpected response: ${response.status}`, response.data);
            return next(new errorHandling("Unable to send email", 400));
        }
    } catch (error) {
        console.error('Error sending email:', error.response ? error.response.data : error.message);
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
};

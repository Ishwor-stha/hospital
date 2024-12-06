module.exports.approveMessage = (name, doctorName, date, time) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f4f4f9;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            font-size: 16px;
        }
        .email-header {
            background-color: #4CAF50;
            color: #fff;
            text-align: center;
            padding: 20px;
        }
        .email-header h2 {
            margin: 0;
        }
        .email-content {
            padding: 20px;
        }
        .email-content p {
            margin: 10px 0;
        }
        .appointment-details {
            margin: 20px 0;
            padding: 15px;
            background: #f9f9f9;
            border-left: 4px solid #4CAF50;
        }
        .appointment-details strong {
            display: block;
            margin: 5px 0;
        }
        .footer {
            font-size: 0.85em;
            color: #777;
            text-align: center;
            padding: 20px;
            background: #f1f1f1;
            border-top: 1px solid #ddd;
        }
        .footer a {
            color: #4CAF50;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h2>Appointment Confirmation</h2>
        </div>
        <div class="email-content">
            <p>Dear ${name},</p>
            <p>We are excited to inform you that your appointment with <strong>Dr. ${doctorName}</strong> has been approved!</p>
            <div class="appointment-details">
                <strong>Date:</strong> ${date}
                <strong>Time:</strong> ${time}
            </div>
            <p>Please arrive at least 15 minutes early and bring any necessary documents.</p>
        </div>
        <div class="footer">
            <p>Thank you,</p>
            <p><strong>${process.env.hospital_name}</strong></p>
            <p>Contact: ${process.env.hospital_contact}</p>
            <p><a href="${process.env.hospital_website}">Visit our website</a></p>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports.rejectMessage = (name, doctorName, reason) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f4f4f9;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            font-size: 16px;
        }
        .email-header {
            background-color: #E53935;
            color: #fff;
            text-align: center;
            padding: 20px;
        }
        .email-header h2 {
            margin: 0;
        }
        .email-content {
            padding: 20px;
        }
        .email-content p {
            margin: 10px 0;
        }
        .appointment-details {
            margin: 20px 0;
            padding: 15px;
            background: #f9f9f9;
            border-left: 4px solid #E53935;
        }
        .appointment-details strong {
            display: block;
            margin: 5px 0;
        }
        .footer {
            font-size: 0.85em;
            color: #777;
            text-align: center;
            padding: 20px;
            background: #f1f1f1;
            border-top: 1px solid #ddd;
        }
        .footer a {
            color: #E53935;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h2>Appointment Rejected</h2>
        </div>
        <div class="email-content">
            <p>Dear ${name},</p>
            <p>We regret to inform you that your appointment with <strong>Dr. ${doctorName}</strong> has been rejected.</p>
            <div class="appointment-details">
                <strong>Reason:</strong> ${reason}
            </div>
        </div>
        <div class="footer">
            <p>Thank you,</p>
            <p><strong>${process.env.hospital_name}</strong></p>
            <p>Contact: ${process.env.hospital_contact}</p>
            <p><a href="${process.env.hospital_website}">Visit our website</a></p>
        </div>
    </div>
</body>
</html>
    `;
};

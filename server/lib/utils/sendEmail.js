import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


export const sendSignupNotification = async (userMail, username) => {
    console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY);
    const msg = {
        to: userMail,
        from: 'colleterhyosua@gmail.com',
        subject: 'Bienvenue sur Peakture!',
        text: `Salut ${username}, Ton compte a bien été créé! `,
        html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background: #f9f9f9;">
                <div style="text-align: center;">
                    <h2 style="color: #333;">Bienvenue sur <span style="color: #007bff;">Peakture</span> 🎉</h2>
                </div>
                <br />
                <p style="font-size: 16px; color: #555;">
                    Salut <strong>${username}</strong>,<br>
                    Je suis ravis de t’accueillir sur Peakture ! 📸✨
                    Partage tes plus belles photos, découvre celles des autres et monte dans le classement !
                </p>
                <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">
                    À bientôt sur Peakture ! <br>
                    <em>Hyo</em>
                </p>
                </div>
            `,
    }

    try {
        await sgMail.send(msg)
        console.log("Mail d'enregistrement envoyé")
    }catch(error){
        console.error('Erreur lors de l\'envoi du mail:', error.response ? error.response.body: error.message)
    }
}


export const sendFamilyNotification = async (userMail, username, familyName, familyId, inviteCode) => {
    console.log('Sendgrid receiver info: ', userMail, username, familyName, familyId, inviteCode);
    const msg = {
        to: userMail,
        from: 'colleterhyosua@gmail.com',
        subject: `Ta Peakture Family "${familyName}" t\'attend !`,
        text: `Salut ${username}, Ta Family a bien été créé! `,
        html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Peakture - Création de votre famille</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            background: #ffffff;
                            padding: 20px;
                            border-radius: 10px;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            text-align: center;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #eeeeee;
                        }
                        .header h1 {
                            color: #333;
                        }
                        .content {
                            padding: 20px 0;
                            line-height: 1.6;
                            color: #555;
                        }
                        .invite-code {
                            font-size: 18px;
                            font-weight: bold;
                            color: #d9534f;
                            background: #ffe8e6;
                            padding: 10px;
                            text-align: center;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                        .btn {
                            display: block;
                            width: 200px;
                            margin: 20px auto;
                            padding: 12px;
                            background: #007BFF;
                            color: white;
                            text-align: center;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            font-size: 12px;
                            color: #888;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Félicitations, ${username}!</h1>
                            <p>Ta famille <strong>${familyName}</strong> est prête sur Peakture !</p>
                        </div>
                        <div class="content">
                            <p>Tu es à présent l’administrateur de cette famille et tu peux donc inviter tes proches à la rejoindre.</p>
                            
                            <div class="invite-code">
                                🔑 <strong>Code d’invitation :</strong> ${inviteCode}
                                <a href="https://wa.me/?text=Rejoins%20ma%20famille%20sur%20Peakture%20!%20Utilise%20ce%20code%20d%27invitation%20:%20${inviteCode}"
                                style="display: block; background: #25D366; color: white; padding: 12px; text-align: center; border-radius: 5px; text-decoration: none; font-weight: bold;">
                                    📲 Partager sur WhatsApp
                                </a>
                            </div>

                            <h3>✨ Rappel des fonctionnalités en tant qu’admin :</h3>
                            <ul>
                                <li>📸 <strong>Créer des albums à thème</strong> : Possibilité de lancer un concours photo chaque mois.</li>
                                <li>✅ <strong>Clôturer les votes</strong> et découvrir ainsi la <em>Peakture</em> gagnante du mois.</li>
                                <li>🏆 <strong>Encourager la participation</strong> : Animer la communauté et motiver les membres.</li>
                            </ul>

                            <p>📅 <strong>Peakture</strong>, c’est un concours photo mensuel où chacun peut soumettre sa meilleure photo selon un thème défini. À la fin du mois, une photo est élue et permet de gagner des points pour le classement général.</p>

                            <a href="http://localhost:5173/family/${familyId}" class="btn">Accéder à ma famille</a>
                        </div>
                        <div class="footer">
                            <p>À très bientôt sur <strong>Peakture</strong> ! 🚀</p>
                            <p>Hyo</p>
                        </div>
                    </div>
                </body>
                </html>

            `,
    }

    try {
        const response = await sgMail.send(msg);
        console.log("Mail d'enregistrement envoyé :", response);
    }catch(error){
        console.error('Erreur lors de l\'envoi du mail:', error.response ? error.response.body: error.message)
    }
}

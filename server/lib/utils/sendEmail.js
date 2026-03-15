import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const envLink = process.env.NODE_ENV === 'production' ? 'https://peakture.fr' : 'http://localhost:5173'
export const sendSignupNotification = async (userMail, username) => {
    const msg = {
        to: userMail,
        from: 'hyo@peakture.fr',
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
                <a href="${envLink}/?showLoginForm=true" style="display:inline-block;margin-top:20px;padding:12px 20px;background-color:rgb(141, 14, 226);color:white;text-decoration:none;border-radius:6px;font-weight:bold;">Accéder à mon compte</a>
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
    const msg = {
        to: userMail,
        from: 'hyo@peakture.fr',
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
                                <a
                                href="https://wa.me/?text=Rejoins%20ma%20famille%20sur%20Peakture%20!%20Clique%20ici%20👉%20https%3A%2F%2Fpeakture.fr%2F%3FinviteCode=${inviteCode}"
                                target="_blank"
                                rel="noopener noreferrer"
                                style="display: block; background: #25D366; color: white; padding: 12px; text-align: center; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;"
                                >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" width="20" height="20" style="vertical-align: middle;" />
                                    Partager sur WhatsApp
                                </a>

                            </div>

                            <h3>✨ Rappel des fonctionnalités en tant qu’admin :</h3>
                            <ul>
                                <li>📸 <strong>Créer des albums à thème</strong> : Possibilité de lancer un concours photo chaque mois.</li>
                                <li>✅ <strong>Clôturer les votes</strong> et découvrir ainsi la <em>Peakture</em> gagnante du mois.</li>
                                <li>🏆 <strong>Encourager la participation</strong> : Animer la communauté et motiver les membres.</li>
                            </ul>

                            <p>📅 <strong>Peakture</strong>, c’est un concours photo mensuel où chacun peut soumettre sa meilleure photo selon un thème défini. À la fin du mois, une photo est élue et permet de gagner des points pour le classement général.</p>

                            <a href="${envLink}/family/${familyId}" style="display:inline-block;margin-top:20px;padding:12px 20px;background-color:rgb(141, 14, 226);color:white;text-decoration:none;border-radius:6px;font-weight:bold;">Accéder à ma famille</a>
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

export const sendTieNotification = async (userMail, username, albumId) => {
    const msg = {
        to: userMail,
        from: 'hyo@peakture.fr',
        subject: `Il est temps de départager les votes !`,
        text: `Salut ${username}, Tu dois départager les votes !`,
        html: `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8" />
                    <title>Départage des votes</title>
                    <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f6f9fc;
                        padding: 20px;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: auto;
                        background-color: #ffffff;
                        border-radius: 10px;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.05);
                        padding: 30px;
                    }
                    h1 {
                        color: rgb(141, 14, 226)
                    }
                    .footer {
                        margin-top: 40px;
                        font-size: 13px;
                        color: #888;
                        text-align: center;
                    }
                    </style>
                </head>
                <body>
                    <div class="container">
                    <h1>Il est temps de départager les votes !</h1>
                    <p>Bonjour <strong>${username}</strong>,</p>

                    <p>Félicitations encore pour ta victoire lors du dernier concours photo sur <strong>Peakture</strong> ! 🎉</p>

                    <p>Ce mois-ci, les votes sont serrés!</p>

                    <p>En tant que gagnant du mois précédent, tu as l’honneur de départager les finalistes et de désigner la photo qui, selon toi, mérite de décrocher la première place ce mois-ci.</p>

                    <p><strong>Voici les photos en compétition :</strong></p>
                    <a href="${envLink}/album/${albumId}" style="display:inline-block;margin-top:20px;padding:12px 20px;background-color:rgb(141, 14, 226);color:white;text-decoration:none;border-radius:6px;font-weight:bold;">Voir les finalistes</a>

                    <p>Tu as <strong>24 heures</strong> pour départager les votes, après cela, le gagnant sera tiré au sort.</p>

                    <p>On compte sur toi pour trancher avec justesse 📷✨</p>

                    <p>À très vite,<br>
                    <strong>Peakture</strong></p>

                    <p><em>PS : Si tu as la moindre question ou un souci pour accéder à la galerie, réponds simplement à ce mail.</em></p>

                    <div class="footer">
                        © 2025 Peakture
                    </div>
                    </div>
                </body>
                </html>


            `,
    }

    try {
        const response = await sgMail.send(msg);
        console.log("Mail de notification de Tie Break envoyé :", response);
    }catch(error){
        console.error('Erreur lors de l\'envoi du mail:', error.response ? error.response.body: error.message)
    }
}

export const sendPasswordResetNotification = async (username, email, resetUrl) => {
    const msg = {
        to: email,
        from: 'hyo@peakture.fr',
        subject: `Réinitialisation de ton mot de passe Peakture`,
        text: `Salut ${username}, Tu as demandé la réinitialisation de ton mot de passe !`,
        html: `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8" />
                    <title>Réinitialisation de mot de passe</title>
                    <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f6f9fc;
                        padding: 20px;
                        
                    }
                    .container {
                        max-width: 600px;
                        margin: auto;
                        background-color: #ffffff;
                        border-radius: 10px;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.05);
                        padding: 30px;
                    }
                    h1 {
                        color:rgb(141, 14, 226);
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 12px 20px;
                        background-color:rgb(141, 14, 226);
                        color: white;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 40px;
                        font-size: 13px;
                        color: #888;
                        text-align: center;
                    }
                    </style>
                </head>
                <body>
                    <div class="container">
                    <h1>Réinitialisation de ton mot de passe</h1>
                    <p>Bonjour <strong>${username}</strong>,</p>

                    <p>Demande de réinitialisation de mot de passe pour ton compte Peakture.</p>

                    <p>Pour réinitialiser ton mot de passe, clique sur le bouton ci-dessous :</p>

                    <a href="${resetUrl}" style="display:inline-block;margin-top:20px;padding:12px 20px;background-color:rgb(141, 14, 226);color:white;text-decoration:none;border-radius:6px;font-weight:bold;">Réinitialiser mon mot de passe</a>
                    <p>Ce lien est valable pendant 1 heure.</p>
                    <p>Si tu n’as pas demandé cette réinitialisation, ignore simplement ce message.</p>

                    <p>À très vite,<br>
                    <strong>Peakture</strong></p>

                    <div class="footer">
                        © 2025 Peakture
                    </div>
                    </div>
                </body>
                </html>
            `,
    }
    try {
        const response = await sgMail.send(msg);
        console.log("Mail de réinitialisation de mot de passe envoyé :", response);
    }
    catch(error){
        console.error('Erreur lors de l\'envoi du mail:', error.response ? error.response.body: error.message)
    }
}
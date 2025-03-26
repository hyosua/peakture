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

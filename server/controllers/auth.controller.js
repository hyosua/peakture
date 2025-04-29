import bcrypt from 'bcryptjs'
import User from '../models/user.model.js'
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js'
import Family from '../models/family.model.js'
import { sendSignupNotification } from '../lib/utils/sendEmail.js'

export const signup = async (req, res) => {
    try {
        const { username, email, password, inviteCode } = req.body
        
        const existingUser = await User.findOne({ username })
        if(existingUser){
            return res.status(400).json({ error: "Ce pseudo est déjà pris"})
        }

        const existingEmail = await User.findOne({ email })
        if(existingEmail){
            return res.status(400).json({ error: "Cet email est déjà utilisé"})
        }

        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })

        console.log("Invite code", inviteCode)
        if(inviteCode){
            const result = await Family.findOneAndUpdate(
                { inviteCode },
                { $push: { members: newUser._id }},
                { new: true }
            )
            console.log("Family update Result:", result)
            if(!result){
                return res.status(400).json({error: "Code d'invitation invalide"})
            }
            
            newUser.familyId = result._id
            
        }

        if(newUser){
            generateTokenAndSetCookie(res, newUser._id)
            await newUser.save()
            await sendSignupNotification(email, username)

            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                role: newUser.role,
                email: newUser.email,
                familyId: newUser.familyId,
                avatar: newUser.avatar,
                
            })
        } else{
            res.status(400).json({error: "Données utilisateur invalides"})
        }
    }catch (error){
        console.log("Error in signup controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({username})
        const correctPass = await bcrypt.compare(password, user?.password || "")

        if(!user){
            return res.status(400).json({error: "Utilisateur introuvable..."})
        }

        if(!correctPass){
            return res.status(400).json({error: "Qui va là? mot de passe incorrect"})
        }

        res.clearCookie("sessionId"); // Supprime le sessionId d'invité

        generateTokenAndSetCookie(res, user._id)

        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            email: user.email,
            familyId: user.familyId,
            avatar: user.avatar,
            isGuest: user.isGuest
            
        })

    }catch (error){
        console.log("Error in login controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {
            httpOnly: true,
            sameSite: "none", 
            secure: true,     
            expires: new Date(0),
        });
        res.status(200).json({message: "Tu es bien déconnecté. A bientôt pour de nouvelles aventures!"})

    }catch (error){
        console.log("Error in logout controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

export const getMe = async (req, res) => {
    try {
        console.log("---- API /api/auth/me CALLED ----");
        console.log("Cookies envoyés :", req.cookies);
        console.log("req.user:", req.user);
        console.log("req.guest:", req.guest);
        let user = req.user || req.guest
        
        if(!user){
            console.log("Aucun utilisateur trouvé dans req");

            return res.status(400).json({error: "Aucun utilisateur"})
        }

        if(req.user){

             // Convertir le document Mongoose en objet JS standard
             const userObj = user.toObject ? user.toObject() : user;
            
             // Récupérer les détails de la famille
             const familyData = userObj.familyId 
                ? await Family.findById(userObj.familyId) 
                : null;

                console.log("Utilisateur connecté, userObj:", userObj);
            console.log("Famille trouvée:", familyData);
 
             // Renvoyer l'utilisateur avec les données de famille
             return res.status(200).json({
                 ...userObj,
                 family: userObj.familyId || null,
                 familyData
            })

        }

        console.log("Utilisateur invité, guest session:", user);
        res.status(200).json(user)
    }catch (error){
        console.log("Error in getMe controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

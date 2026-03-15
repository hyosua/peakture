import { z } from 'zod'

// Middleware générique : valide req.body contre un schéma Zod
export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
        const message = result.error.issues[0]?.message || "Données invalides"
        return res.status(400).json({ error: message })
    }
    req.body = result.data
    next()
}

const objectIdRegex = /^[a-f\d]{24}$/i
const inviteCodeRegex = /^[A-F0-9]{6}$/i
const cloudinaryUrlRegex = /^https:\/\/res\.cloudinary\.com\//

export const signupSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3, "Le pseudo doit contenir au moins 3 caractères")
        .max(30, "Le pseudo ne peut pas dépasser 30 caractères")
        .regex(/^[a-zA-Z0-9_-]+$/, "Le pseudo ne peut contenir que des lettres, chiffres, - et _"),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Adresse email invalide"),
    password: z
        .string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    inviteCode: z
        .string()
        .regex(inviteCodeRegex, "Code d'invitation invalide")
        .optional()
        .or(z.literal(''))
        .transform(val => val || undefined)
})

export const loginSchema = z.object({
    identifier: z.string().trim().min(1, "Identifiant requis"),
    password: z.string().min(1, "Mot de passe requis")
})

export const requestPasswordResetSchema = z.object({
    email: z.string().trim().toLowerCase().email("Adresse email invalide")
})

export const resetPasswordSchema = z.object({
    resetToken: z.string().min(1, "Token requis"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères")
})

export const createAlbumSchema = z.object({
    theme: z.string().trim().min(1, "Le thème est requis").max(100, "Le thème est trop long"),
    familyId: z.string().regex(objectIdRegex, "Identifiant de famille invalide"),
    month: z.coerce.number().int().min(1, "Choisis un mois valide").max(12),
    year: z.coerce.number().int().min(2020).max(2100),
    admin: z.string().regex(objectIdRegex, "Identifiant admin invalide"),
    adminModel: z.enum(['User', 'Guest']).optional(),
    description: z.string().trim().max(500).optional(),
})

export const editAlbumThemeSchema = z.object({
    theme: z.string().trim().min(1, "Le thème est requis").max(100, "Le thème est trop long")
})

export const editAlbumDescriptionSchema = z.object({
    description: z.string().trim().max(500, "La description est trop longue")
})

export const addPhotoSchema = z.object({
    albumId: z
        .string()
        .regex(objectIdRegex, "Identifiant d'album invalide"),
    src: z
        .string()
        .url("URL invalide")
        .regex(cloudinaryUrlRegex, "Source d'image non autorisée"),
    username: z.string().trim().max(50).optional()
})

export const editFamilyNameSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(50, "Le nom ne peut pas dépasser 50 caractères")
})

export const validateInviteCodeSchema = z.object({
    inviteCode: z
        .string()
        .regex(inviteCodeRegex, "Format de code d'invitation invalide")
})

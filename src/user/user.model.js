import mongoose from 'mongoose';
const { Schema } = mongoose;
const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true,
            maxlength: [25, 'El nombre no puede tener más de 25 caracteres'],
        },
        surname: {
            type: String,
            required: [true, 'El apellido es obligatorio'],
            trim: true,
            maxlength: [25, 'El apellido no puede tener más de 25 caracteres'],
        },
        username: {
            type: String,
            required: [true, 'El nombre de usuario es obligatorio'],
            unique: true,
            trim: true,
            lowercase: true,
            minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
            maxlength: [30, 'El nombre de usuario no puede tener más de 30 caracteres'],
        },
        email: {
            type: String,
            required: [true, 'El correo es obligatorio'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'El correo no tiene un formato válido'],
        },
        password: {
            type: String,
            required: [true, 'La contraseña es obligatoria'],
            select: false, 
        },
        role: {
            type: String,
            enum: ['USER', 'ADMIN'],
            default: 'USER',
        },
        status: {
            type: Boolean,
            default: false,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: {
            type: String,
            default: null,
            select: false,
        },
        emailVerificationTokenExpiry: {
            type: Date,
            default: null,
            select: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
export const User = mongoose.model('User', userSchema);
 
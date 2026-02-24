import mongoose from 'mongoose';

const { Schema } = mongoose;

const publicationSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Es necesario proporcionar un título'],
            trim: true,
            minlength: [3, 'El encabezado requiere un mínimo de 3 caracteres'],
            maxlength: [100, 'El título excede el límite permitido de 100 caracteres'],
        },
        category: {
            type: String,
            required: [true, 'Debe seleccionar una categoría'],
            enum: {
                values: ['Opinión', 'Tecnología', 'Deportes', 'Política', 'Entretenimiento', 'Educación', 'Salud', 'Otro'],
                message: 'La clasificación {VALUE} no se encuentra disponible',
            },
        },
        content: {
            type: String,
            required: [true, 'El cuerpo del texto no puede estar vacío'],
            trim: true,
            minlength: [10, 'La descripción es demasiado breve, use al menos 10 caracteres'],
            maxlength: [2000, 'El contenido sobrepasa la extensión máxima de 2000 caracteres'],
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'deleted'],
            default: 'active',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

publicationSchema.index({ author: 1 });
publicationSchema.index({ category: 1 });
publicationSchema.index({ createdAt: -1 });
publicationSchema.index({ status: 1 });

export const Publication = mongoose.model('Publication', publicationSchema);
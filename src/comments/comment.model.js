import mongoose from 'mongoose';
const { Schema } = mongoose;
const commentSchema = new Schema(
    {
    content: {
        type: String,
        required: [true, 'El contenido del comentario es obligatorio'],   trim: true,
        minlength: [1, 'El comentario no puede estar vacío'],
        maxlength: [500, 'El comentario no puede tener más de 500 caracteres'],
    },
     publication: {
        type: Schema.Types.ObjectId,
        ref: 'Publication',
        required: true,
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

commentSchema.index({ publication: 1, status: 1 });
commentSchema.index({ author: 1 });
export const Comment = mongoose.model('Comment', commentSchema);

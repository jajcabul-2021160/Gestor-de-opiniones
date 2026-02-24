import { Comment } from './comment.model.js';
import { Publication } from '../publications/publication.model.js';
export const createComment = async (req, res) => {
    try {
        const { id: publicationId } = req.params;
        const { content } = req.body;

        const publication = await Publication.findOne({ _id: publicationId, status: 'active' });

        if (!publication) {
            return res.status(404).json({
                success: false,
                message: 'La publicación solicitada no existe.',
            });
        }

        const comment = await Comment.create({
            content,
            publication: publicationId,
            author: req.userId,
        });

        await comment.populate('author', 'name surname username');

        return res.status(201).json({
            success: true,
            message: 'El comentario se ha publicado correctamente.',
            comment,
        });
    } catch (error) {
        console.error('Error en createComment:', error);
        return res.status(500).json({
            success: false,
            message: 'Se produjo un fallo inesperado en el sistema.',
        });
    }
};

export const getCommentsByPublication = async (req, res) => {
    try {
        const { id: publicationId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const publication = await Publication.findOne({ _id: publicationId, status: 'active' });

        if (!publication) {
            return res.status(404).json({
                success: false,
                message: 'No se pudo localizar la publicación.',
            });
        }

        const filter = { publication: publicationId, status: 'active' };

        const [comments, total] = await Promise.all([
            Comment.find(filter)
                .populate('author', 'name surname username')
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Comment.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            comments,
        });
    } catch (error) {
        console.error('Error en getCommentsByPublication:', error);
        return res.status(500).json({
            success: false,
            message: 'Incidencia técnica al recuperar los datos.',
        });
    }
};

export const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params; 
        const { content } = req.body;

        const comment = await Comment.findOne({ _id: commentId, status: 'active' });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'El comentario no se encuentra disponible.',
            });
        }

        if (comment.author.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado: no eres el propietario de este contenido.',
            });
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { content },
            { new: true, runValidators: true }
        ).populate('author', 'name surname username');

        return res.status(200).json({
            success: true,
            message: 'Cambios guardados con éxito.',
            comment: updatedComment,
        });
    } catch (error) {
        console.error('Error en updateComment:', error);
        return res.status(500).json({
            success: false,
            message: 'No se pudo completar la actualización debido a un error interno.',
        });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findOne({ _id: commentId, status: 'active' });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'No existe el comentario que intentas remover.',
            });
        }

        if (comment.author.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'No posees las credenciales necesarias para realizar esta acción.',
            });
        }

        await Comment.findByIdAndUpdate(commentId, { status: 'deleted' });

        return res.status(200).json({
            success: true,
            message: 'Entrada eliminada de forma satisfactoria.',
        });
    } catch (error) {
        console.error('Error en deleteComment:', error);
        return res.status(500).json({
            success: false,
            message: 'Error de servidor al intentar borrar el registro.',
        });
    }
};

export const getMyComments = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { author: req.userId, status: 'active' };

        const [comments, total] = await Promise.all([
            Comment.find(filter)
                .populate('publication', 'title category')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Comment.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            comments,
        });
    } catch (error) {
        console.error('Error en getMyComments:', error);
        return res.status(500).json({
            success: false,
            message: 'Imposible obtener tu historial de comentarios en este momento.',
        });
    }
};
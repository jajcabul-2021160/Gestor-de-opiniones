import { Publication } from './publication.model.js';
import { Comment } from '../comments/comment.model.js';

export const createPublication = async (req, res) => {
    try {
        const { title, category, content } = req.body;

        const publication = await Publication.create({
        title,
        category,
        content,
        author: req.userId,
        });

        await publication.populate('author', 'name surname username');

        return res.status(201).json({
        success: true,
        message: 'El post ha sido registrado con éxito.',
        publication,
        });
    } catch (error) {
        console.error('Error en createPublication:', error);
        return res.status(500).json({
        success: false,
        message: 'Fallo general del sistema al generar la publicación.',
        });
    }
};

export const getPublications = async (req, res) => {
    try {
        const { page = 1, limit = 10, category } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { status: 'active' };
        if (category) filter.category = category;

        const [publications, total] = await Promise.all([
            Publication.find(filter)
            .populate('author', 'name surname username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
            Publication.countDocuments(filter),
        ]);

        const publicationsWithComments = await Promise.all(
            publications.map(async (pub) => {
                const comments = await Comment.find({ publication: pub._id, status: 'active' })
                .populate('author', 'name surname username')
                .sort({ createdAt: 1 });
                return {
                ...pub.toObject(),
                comments,
                totalComments: comments.length,
                };
            })
        );

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            publications: publicationsWithComments,
        });
    } catch (error) {
        console.error('Error en getPublications:', error);
        return res.status(500).json({
            success: false,
            message: 'No se pudo procesar la solicitud de obtención de datos.',
        });
    }
};

export const getPublicationById = async (req, res) => {
    try {
        const { id } = req.params;

        const publication = await Publication.findOne({ _id: id, status: 'active' })
            .populate('author', 'name surname username');

        if (!publication) {
            return res.status(404).json({
                success: false,
                message: 'El contenido solicitado no se encuentra en nuestros registros.',
            });
        }

        const comments = await Comment.find({ publication: id, status: 'active' })
            .populate('author', 'name surname username')
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            publication,
            comments,
            totalComments: comments.length,
        });
    } catch (error) {
        console.error('Error en getPublicationById:', error);
        return res.status(500).json({
            success: false,
            message: 'Ocurrió una anomalía interna en el servidor.',
        });
    }
};

export const updatePublication = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, content } = req.body;

        const publication = await Publication.findOne({ _id: id, status: 'active' });

        if (!publication) {
            return res.status(404).json({
                success: false,
                message: 'No se ha localizado la publicación para actualizar.',
            });
        }

        if (publication.author.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Acción denegada: carece de privilegios para modificar esta entrada.',
            });
        }

        const updateData = {};
        if (title) updateData.title = title;
        if (category) updateData.category = category;
        if (content) updateData.content = content;

        const updatedPublication = await Publication.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('author', 'name surname username');

        return res.status(200).json({
            success: true,
            message: 'Información actualizada correctamente.',
            publication: updatedPublication,
        });
    } catch (error) {
        console.error('Error en updatePublication:', error);
        return res.status(500).json({
            success: false,
            message: 'Error crítico al intentar editar el registro.',
        });
    }
};

export const deletePublication = async (req, res) => {
    try {
        const { id } = req.params;

        const publication = await Publication.findOne({ _id: id, status: 'active' });

        if (!publication) {
            return res.status(404).json({
                success: false,
                message: 'La publicación que desea remover no ha sido hallada.',
            });
        }

        if (publication.author.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'No está autorizado para eliminar este elemento.',
            });
        }

        await Promise.all([
            Publication.findByIdAndUpdate(id, { status: 'deleted' }),
            Comment.updateMany({ publication: id }, { status: 'deleted' }),
        ]);

        return res.status(200).json({
            success: true,
            message: 'El registro ha sido removido satisfactoriamente.',
        });
    } catch (error) {
        console.error('Error en deletePublication:', error);
        return res.status(500).json({
            success: false,
            message: 'Se presentó un inconveniente interno al intentar borrar.',
        });
    }
};

export const getMyPublications = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { author: req.userId, status: 'active' };

        const [publications, total] = await Promise.all([
            Publication.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Publication.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            publications,
        });
    } catch (error) {
        console.error('Error en getMyPublications:', error);
        return res.status(500).json({
            success: false,
            message: 'Error de servidor al recuperar sus publicaciones personales.',
        });
    }
};
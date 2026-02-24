import { Router } from 'express';
import {
    createPublication,
    getPublications,
    getPublicationById,
    updatePublication,
    deletePublication,
    getMyPublications,
} from './publication.controller.js';
import { validatePublication } from '../../middlewares/validation.js';

const router = Router();
// get
router.get('/', getPublications);
// get
router.get('/my', getMyPublications);
// get
router.get('/:id', getPublicationById);
// post
router.post('/', validatePublication, createPublication);
// put
router.put('/:id', validatePublication, updatePublication);
// delete
router.delete('/:id', deletePublication);
export default router;

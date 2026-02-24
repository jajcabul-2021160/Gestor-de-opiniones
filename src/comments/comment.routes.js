import { Router } from 'express';
import {createComment, getCommentsByPublication, updateComment, deleteComment, getMyComments, } from './comment.controller.js';
import { validateComment } from '../../middlewares/validation.js';

const router = Router();
router.get('/my', getMyComments);

// get
router.get('/publication/:id', getCommentsByPublication);
// post 
router.post('/publication/:id', validateComment, createComment);
// put (editar)
router.put('/:commentId', validateComment, updateComment);
// delete (eliminar)
router.delete('/:commentId', deleteComment); 
export default router;

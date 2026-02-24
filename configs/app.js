'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { mongoConnection } from './db-mongo.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { validateJWT } from '../middlewares/validate-JWT.js';
import { requestLimit } from '../middlewares/request-limit.js';
import authRoutes from '../src/auth/auth.routes.js';
import userRoutes from '../src/user/user.routes.js';
import publicationRoutes from '../src/publications/publication.routes.js';
import commentRoutes from '../src/comments/comment.routes.js';
import { User } from '../src/user/user.model.js';
import { hashPassword } from '../utils/password-utils.js';

const BASE_PATH = '/gestoropiniones/v1';

const ensureRootAdmin = async () => {
    try {
        const existingRoot = await User.findOne({ email: process.env.ROOT_ADMIN_EMAIL });

        if (existingRoot) {
            console.log('MongoDB | Root admin ya existe');
            return;
        }

        console.log('MongoDB | Creando ROOT ADMIN...');

        const hashedPassword = await hashPassword(process.env.ROOT_ADMIN_PASSWORD);

        await User.create({
            name: 'Root',
            surname: 'Admin',
            username: process.env.ROOT_ADMIN_USERNAME,
            email: process.env.ROOT_ADMIN_EMAIL,
            password: hashedPassword,
            role: 'ADMIN',
            status: true,
            emailVerified: true,
        });

        console.log('MongoDB | ROOT ADMIN CREADO EXITOSAMENTE');
    } catch (error) {
        console.error('Error creando root admin:', error.message);
    }
};



const middlewares = (app) => {
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(morgan('dev'));
    app.use(requestLimit);
};

const routes = (app) => {
    app.use(`${BASE_PATH}/auth`, authRoutes);
    app.use(`${BASE_PATH}/users`, validateJWT, userRoutes);
    app.use(`${BASE_PATH}/publications`, validateJWT, publicationRoutes);
    app.use(`${BASE_PATH}/comments`, validateJWT, commentRoutes);

    app.get(`${BASE_PATH}/health`, (req, res) => {
        return res.status(200).json({
            success: true,
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'Gestor de opiniones',
            database: { mongodb: 'Connected' },
        });
    });

    app.use((req, res) => {
        res.status(404).json({ success: false, message: 'Endpoint no encontrado' });
    });
};

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3000;

    try {
        console.log('Iniciando: Gestor de opiniones');

        await mongoConnection();
        await ensureRootAdmin();

        middlewares(app);
        routes(app);

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto: ${PORT}`);
            console.log(`Health: http://localhost:${PORT}${BASE_PATH}/health`);

        });

    } catch (error) {
        console.error('ERROR: al iniciar el servidor:', error.message);
        process.exit(1);
    }
};

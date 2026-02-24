'use strict';

import mongoose from 'mongoose';

export const mongoConnection = async () => {
    try {
        console.log('MongoDB | Intentando conectar...');

        mongoose.connection.on('error', (err) => {
            console.error(`MongoDB | Error de conexión: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB | Desconectado de la base de datos');
        });

        mongoose.connection.on('connected', () => {
            console.log('MongoDB | Conectado exitosamente');
        });

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
        });

    } catch (error) {
        console.error('MongoDB | No se pudo conectar:', error.message);
        process.exit(1);
    }
};

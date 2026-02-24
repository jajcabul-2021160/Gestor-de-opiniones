'use strict';

import dotenv from 'dotenv';
import { initServer } from './configs/app.js';

dotenv.config();

process.on('uncaughtException', (error) => {
    console.error('Excepción no capturada:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('Promesa rechazada no manejada:', reason);
    process.exit(1);
});

console.log('Iniciando gestoropiniones...');
initServer();

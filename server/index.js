import express from "express";
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';
import cors from 'cors';
import apiRouter from './api.js';

const api = express();
api.use(cors());
api.use('/', apiRouter);
api.listen(process.env.API_PORT, () => console.log("Server is listening..."));
// inicia o listener que serve o frontend no mesmo processo do backend caso esteja em uma production build
// para rodar uma production build esta precisa ter sido previamente bundled usando "npm run build"
// no caso de uma development build o frontend deve ser iniciado separadamente usando "npm run dev"
if(process.env.NODE_ENV === 'production'){
    const www = express();
    const __dirname = dirname(fileURLToPath(import.meta.url));
    www.use(express.static(join(__dirname, '..', 'dist')));
    www.get('*', (_, res) => res.sendFile(join(__dirname, '..', 'dist', 'index.html')));
    www.listen(process.env.CLIENT_PORT, () => console.log("Client is listening..."));
}
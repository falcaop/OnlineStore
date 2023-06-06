import express from "express";
import bodyParser from 'body-parser';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';
import apiRouter from './api.js';

const api = express();
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({extended: false}));
api.use('/', apiRouter);
api.listen(3000, () => console.log("Server is listening..."));
if(process.env.NODE_ENV === 'production'){
    const www = express();
    const __dirname = dirname(fileURLToPath(import.meta.url));
    www.use(express.static(join(__dirname, '..', 'dist')));
    www.get('*', (_, res) => res.sendFile(join(__dirname, '..', 'dist', 'index.html')));
    www.listen(8080, () => console.log("Client is listening..."));
}
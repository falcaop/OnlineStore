import {Router} from 'express';
import {fetchData, fetchImage, removeImage, writeData, writeImage} from './db/index.js';
import {body, validationResult} from 'express-validator';
import { sha256 } from 'js-sha256';
import multer from 'multer';

const upload = multer();
const authenticate = admin => (req, res, next) => {
    const authorization = req.header('Authorization');
    if(!authorization || !authorization.startsWith('Basic ')) return res.sendStatus(401);
    const [email, password] = Buffer.from(authorization.split(' ')[1], 'base64').toString().split(':');
    const user = fetchData().users[email];
    if(!user || (user.password !== sha256(password))) return res.sendStatus(401);
    if(admin && !user.isAdmin) return res.sendStatus(403);
    next();
}
const fetchDocument = (model, dry) => (req, res, next) => {
    const document = fetchData()[model].find(({id}) => (id.toString() === req.params.id));
    if(!document) return res.sendStatus(404);
    if(!dry) req.document = document;
    next();
}
const router = Router();
router.get('/products', (req, res) => {
    let products = fetchData().products;
    if(req.query.q) products = products.filter(({name}) => name.toUpperCase().includes(req.query.q.toUpperCase()));
    if(req.query.category) products = products.filter(({category}) => (category === parseInt(req.query.category, 10)));
    res.status(200).json(products);
});
router.get(
    '/products/:id/image',
    fetchDocument('products', true),
    (req, res) => fetchImage(req.params.id, (err, data) => err ? res.sendStatus(404) : res.status(200).send(data)),
);
router.post(
    '/products',
    upload.single('image'),
    authenticate(true),
    body('name').trim().notEmpty(),
    body('price').isFloat({min: 0}),
    body('category').isInt({
        min: 0,
        max: 6,
    }),
    body('stock').isInt({min: 0}),
    (req, res, next) => {
        if(validationResult(req).isEmpty()) return next();
        res.sendStatus(400);
    },
    async (req, res) => {
        const data = fetchData();
        const product = {
            id: data.products.at(-1).id + 1,
            name: req.body.name.trim(),
            description: req.body.description?.trim(),
            price: Math.round(parseFloat(req.body.price) * 100) / 100,
            category: parseInt(req.body.category, 10),
            stock: parseInt(req.body.stock, 10),
        };
        if(req.file) writeImage(product.id, req.file.buffer);
        data.products.push(product);
        writeData(data);
        res.status(201).json(product);
    },
);
router.put(
    '/products/:id',
    upload.single('image'),
    authenticate(true),
    fetchDocument('products', true),
    body('name').trim().notEmpty(),
    body('price').isFloat({min: 0}),
    body('category').isInt({
        min: 0,
        max: 6,
    }),
    body('stock').isInt({min: 0}),
    (req, res, next) => validationResult(req).isEmpty() ? next() : res.sendStatus(400),
    async (req, res) => {
        const data = fetchData();
        const id = parseInt(req.params.id, 10);
        const product = data.products.find(product => (product.id === id));
        product.name = req.body.name.trim();
        product.description = req.body.description?.trim();
        product.price = Math.round(parseFloat(req.body.price) * 100) / 100;
        product.category = parseInt(req.body.category, 10);
        product.stock = parseInt(req.body.stock, 10);
        if(req.file) writeImage(id, req.file.buffer);
        writeData(data);
        res.status(200).json(product);
    },
);
router.delete('/products/:id', authenticate(true), fetchDocument('products', true), (req, res) => {
    const data = fetchData();
    data.products = data.products.filter(({id}) => (id.toString() !== req.params.id));
    removeImage(req.params.id);
    writeData(data);
    res.sendStatus(204);
});
router.head(
    '/authenticate',
    (req, res, next) => authenticate(req.query.admin === '1')(req, res, next),
    (_, res) => res.sendStatus(204),
);
router.get('/coffee', (_, res) => res.sendStatus(418));
router.get('/*', (_, res) => res.sendStatus(404));

export default router;
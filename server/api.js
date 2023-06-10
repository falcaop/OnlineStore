import {Router} from 'express';
import {fetchData, fetchImage, removeImage, writeData, writeImage} from './db/index.js';
import {body, validationResult} from 'express-validator';
import { sha256 } from 'js-sha256';
import multer from 'multer';

const upload = multer();
const authenticate = admin => async (req, res, next) => {
    const authorization = req.header('Authorization');
    if(!authorization || !authorization.startsWith('Basic ')) return res.sendStatus(401);
    const [email, password] = Buffer.from(authorization.split(' ')[1], 'base64').toString().split(':');
    let data;
    try{
        data = await fetchData();
    }
    catch(err){
        console.error(err);
        return res.sendStatus(500);
    }
    const user = data.users[email];
    if(!user || (user.password !== sha256(password))) return res.sendStatus(401);
    if(admin && !user.isAdmin) return res.sendStatus(403);
    next();
}
const fetchProduct = dry => async (req, res, next) => {
    let data;
    try{
        data = await fetchData();
    }
    catch(err){
        console.error(err);
        return res.sendStatus(500);
    }
    const document = data.products.find(({id}) => (id.toString() === req.params.id));
    if(!document) return res.sendStatus(404);
    if(!dry) req.document = document;
    next();
}
const router = Router();
router.head(
    '/authenticate',
    (req, res, next) => authenticate(req.query.admin === '1')(req, res, next),
    (_, res) => res.sendStatus(204),
);
router.head('/products/:id', fetchProduct(true), (_, res) => res.sendStatus(204));
router.get('/products', async (req, res) => {
    let data;
    try{
        data = await fetchData();
    }
    catch(err){
        console.error(err);
        return res.sendStatus(500);
    }
    let products = data.products;
    if(req.query.q || req.query.category || req.query.minPrice || req.query.maxPrice){
        products = products.filter(({name, category, price}) => {
            return (
                (!req.query.q || name.toUpperCase().includes(req.query.q.toUpperCase()))
                &&
                (!req.query.category || (category === parseInt(req.query.category, 10)))
                &&
                (!req.query.minPrice || (price >= req.query.minPrice))
                &&
                (!req.query.maxPrice || (price <= req.query.maxPrice))
            );
        });
    }
    if(req.query.id) products = products.filter(({id}) => req.query.id.includes(id.toString()));
    const sortOrder = parseInt(req.query.sortOrder, 10) || 1;
    if(req.query.sortField === 'name'){
        products.sort((a, b) => (a.name.localeCompare(b.name) * sortOrder));
    }
    else if(['price', 'stock'].includes(req.query.sortField)){
        products.sort((a, b) => ((a[req.query.sortField] - b[req.query.sortField]) * sortOrder));
    }
    res.status(200).json(products);
});
router.get('/products/:id', fetchProduct(), (req, res) => res.status(200).json(req.document));
router.get(
    '/products/:id/image',
    fetchProduct(true),
    (req, res) => fetchImage(req.params.id, (err, data) => err ? res.sendStatus(404) : res.status(200).send(data)),
);
router.get('/users/:email', (req, res, next) => {
    const authorization = req.header('Authorization');
    if(!authorization || !authorization.startsWith('Basic ')) return res.sendStatus(401);
    authenticate(
        req.params.email !== Buffer.from(authorization.split(' ')[1], 'base64').toString().split(':')[0],
    )(req, res, next);
}, async (req, res) => {
    let data;
    try{
        data = await fetchData();
    }
    catch(err){
        console.error(err);
        return res.sendStatus(500);
    }
    const document = data.users[req.params.email];
    if(!document) return res.sendStatus(404);
    const user = {};
    for(const field of ['name', 'phone', 'address']) user[field] = document[field];
    res.status(200).json(user);
});
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
    async (req, res) => {
        if(!validationResult(req).isEmpty()) return res.sendStatus(400);
        let data;
        try{
            data = await fetchData();
        }
        catch(err){
            console.error(err);
            return res.sendStatus(500);
        }
        const product = {
            id: (data.products.at(-1)?.id ?? 0) + 1,
            name: req.body.name.trim(),
            description: req.body.description?.trim(),
            price: Math.round(parseFloat(req.body.price) * 100) / 100,
            category: parseInt(req.body.category, 10),
            stock: parseInt(req.body.stock, 10),
        };
        if(req.file) writeImage(product.id, req.file.buffer);
        data.products.push(product);
        writeData(data, err => {
            if(!err) return res.status(201).json(product);
            console.error(err);
            res.sendStatus(500);
        });
    },
);
router.post(
    '/users',
    upload.none(),
    body('name').trim().notEmpty(),
    body('email').isEmail({
        allow_utf8_local_part: false,
        domain_specific_validation: true,
    }).not().contains(':'),
    body('address').trim().notEmpty(),
    body('phone').isMobilePhone('pt-BR'),
    body('password').isStrongPassword().not().contains(':'),
    async (req, res) => {
        if(!validationResult(req).isEmpty()) return res.sendStatus(400);
        let data;
        try{
            data = await fetchData();
        }
        catch(err){
            console.error(err);
            return res.sendStatus(500);
        }
        if(data.users[req.body.email]) return res.sendStatus(409);
        data.users[req.body.email] = {
            name: req.body.name.trim(),
            address: req.body.address.trim(),
            phone: req.body.phone,
            password: sha256(req.body.password),
        };
        writeData(data, err => {
            if(err){
                console.error(err);
                return res.sendStatus(500);
            };
            res
                .status(201)
                .json({credentials: Buffer.from(`${req.body.email}:${req.body.password}`).toString('base64')});
        });
    },
);
router.put(
    '/products/:id',
    upload.single('image'),
    authenticate(true),
    fetchProduct(true),
    body('name').trim().notEmpty(),
    body('price').isFloat({min: 0}),
    body('category').isInt({
        min: 0,
        max: 6,
    }),
    body('stock').isInt({min: 0}),
    async (req, res) => {
        if(!validationResult(req).isEmpty()) return res.sendStatus(400);
        let data;
        try{
            data = await fetchData();
        }
        catch(err){
            console.error(err);
            return res.sendStatus(500);
        }
        const id = parseInt(req.params.id, 10);
        const product = data.products.find(product => (product.id === id));
        product.name = req.body.name.trim();
        product.description = req.body.description?.trim();
        product.price = Math.round(parseFloat(req.body.price) * 100) / 100;
        product.category = parseInt(req.body.category, 10);
        product.stock = parseInt(req.body.stock, 10);
        if(req.file) writeImage(id, req.file.buffer);
        writeData(data, err => {
            if(!err) return res.status(200).json(product);
            console.error(err);
            res.sendStatus(500);
        });
    },
);
router.delete('/products/:id', authenticate(true), fetchProduct(true), async (req, res) => {
    let data;
    try{
        data = await fetchData();
    }
    catch(err){
        console.error(err);
        return res.sendStatus(500);
    }
    data.products = data.products.filter(({id}) => (id.toString() !== req.params.id));
    removeImage(req.params.id);
    writeData(data, err => {
        if(!err) return res.sendStatus(204);
        console.error(err);
        res.sendStatus(500);
    });
});
router.get('/coffee', (_, res) => res.sendStatus(418));
router.get('/*', (_, res) => res.sendStatus(404));

export default router;
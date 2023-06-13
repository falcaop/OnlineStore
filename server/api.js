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
    req.user = data.users.find(user => (user.email === email));
    if(!req.user || (req.user.password !== sha256(password))) return res.sendStatus(401);
    if(admin && !req.user.isAdmin) return res.sendStatus(403);
    next();
}
const fetchDocument = (model, dry) => async (req, res, next) => {
    let data;
    try{
        data = await fetchData();
    }
    catch(err){
        console.error(err);
        return res.sendStatus(500);
    }
    const document = data[model].find(({id}) => (id.toString() === req.params.id));
    if(!document) return res.sendStatus(404);
    if(!dry) req.document = document;
    next();
}
const router = Router();
router.head(
    '/authenticate',
    async (req, res, next) => await authenticate(req.query.admin === '1')(req, res, next),
    (_, res) => res.sendStatus(204),
);
router.head('/products/:id', fetchDocument('products', true), (_, res) => res.sendStatus(204));
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
    else if(['price', 'sold'].includes(req.query.sortField)){
        products.sort((a, b) => ((a[req.query.sortField] - b[req.query.sortField]) * sortOrder));
    }
    res.status(200).json(products);
});
router.get('/products/:id', fetchDocument('products'), (req, res) => res.status(200).json(req.document));
router.get(
    '/products/:id/image',
    fetchDocument('products', true),
    (req, res) => fetchImage(req.params.id, (err, data) => err ? res.sendStatus(404) : res.status(200).send(data)),
);
router.get('/users/me', authenticate(), (req, res) => {
    const user = {};
    for(const field of ['name', 'phone', 'address', 'isAdmin', 'purchases']) user[field] = req.user[field];
    res.status(200).json(user);
});
router.get('/users', authenticate(true), async (req, res) => {
    let data;
    try{
        data = await fetchData();
    }
    catch(err){
        console.error(err);
        res.sendStatus(500);
    }
    data.users.forEach(user => (user.password = null));
    let {users} = data;
    if(req.query.q) users = users.filter(({name}) => name.toUpperCase().includes(req.query.q.toUpperCase()));
    switch(req.query.admin){
        case '0': users = users.filter(({isAdmin}) => !isAdmin);
        break;
        case '1': users = users.filter(({isAdmin}) => isAdmin);
        break;
    }
    res.status(200).json(users.filter(({id}) => id));
});
router.get('/purchases/:id', authenticate(), (req, res) => {
    const purchase = req.user.purchases.find(({id}) => (id.toString() === req.params.id));
    if(!purchase) return res.sendStatus(404);
    res.status(200).json(purchase);
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
            sold: 0,
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
    body('email').isEmail({allow_utf8_local_part: false}).not().contains(':'),
    body('address').trim().notEmpty(),
    body('phone').isMobilePhone('pt-BR'),
    body('password').isStrongPassword().not().contains(':'),
    body('admin').equals('on').optional(),
    async (req, res, next) => {
        if(!validationResult(req).isEmpty()) return res.sendStatus(400);
        if(req.body.admin) return await authenticate(true)(req, res, next);
        next();
    },
    async (req, res) => {
        let data;
        try{
            data = await fetchData();
        }
        catch(err){
            console.error(err);
            return res.sendStatus(500);
        }
        if(data.users.some(({email}) => (email === req.body.email))) return res.sendStatus(409);
        const user = {
            id: data.users.at(-1).id + 1,
            email: req.body.email,
            name: req.body.name.trim(),
            address: req.body.address.trim(),
            phone: req.body.phone.replace(/[^\d]/g, '').replace(/55(?=\d{10})/, ''),
            password: sha256(req.body.password),
            purchases: [],
        };
        data.users.push(user);
        writeData(data, err => {
            if(err){
                console.error(err);
                return res.sendStatus(500);
            };
            user.password = null;
            res
                .status(201)
                .json(user);
        });
    },
);
router.post(
    '/purchases',
    upload.none(),
    authenticate(),
    body('cardNumber').isInt({min: 0}),
    body('cardDate').isAfter(Date().toString()),
    body('cardCode').isInt({min: 0}).isLength({
        min: 3,
        max: 3,
    }),
    body('cart').toArray().isArray(),
    body('cart.*.id').isInt({min: 1}),
    body('cart.*.amount').isInt({min: 1}),
    body('customs').toArray().isArray(),
    body('customs.*.color').isHexColor(),
    body('customs.*.amount').isInt({min: 1}),
    body('customs.*.image').isURL({
        protocols: ['http', 'https'],
        require_tld: false,
    }),
    body('customs.*.size').isIn(["PP", "P", "M", "G", "GG"]),
    async (req, res) => {
        const cart = JSON.parse(req.body.cart).map(({id, amount}) => ({id, amount}));
        const customs = JSON.parse(req.body.customs).map(({color, amount, image}) => ({color, amount, image}));
        if(!validationResult(req).isEmpty() || (!cart.length && !customs.length)) return res.sendStatus(400);
        let data;
        try{
            data = await fetchData();
        }
        catch(err){
            console.error(err);
            return res.sendStatus(500);
        }
        for(const {id, amount} of cart){
            const product = data.products.find(p => (p.id === id));
            if(!product || (amount > product.stock)){
                return res
                    .status(406)
                    .json({
                        id,
                        name: product?.name,
                        stock: product?.stock ?? null,
                    });
            }
            product.stock -= amount;
            product.sold += amount;
        }
        const user = data.users.find(({id}) => (id === req.user.id));
        const purchase = {
            id: (user.purchases.at(-1)?.id ?? 0) + 1,
            date: Date.now(),
            products: cart,
            customs,
        };
        user.purchases.push(purchase);
        writeData(data, err => {
            if(err){
                console.error(err);
                return res.sendStatus(500);
            };
            res
                .status(201)
                .json(purchase);
        });
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
router.put(
    '/users/me',
    upload.none(),
    authenticate(),
    body('name').trim().notEmpty(),
    body('email').isEmail({
        allow_utf8_local_part: false,
        domain_specific_validation: true,
    }).not().contains(':'),
    body('address').trim().notEmpty(),
    body('phone').isMobilePhone('pt-BR'),
    body('password').isStrongPassword().not().contains(':').optional(),
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
        const user = data.users.find(({id}) => (id === req.user.id));
        if(user.email !== req.body.email){
            if(data.users.some(({email}) => (email === req.body.email))) return res.sendStatus(409);
            user.email = req.body.email;
        }
        user.name = req.body.name.trim();
        user.address = req.body.address.trim();
        user.phone = req.body.phone.replace(/[^\d]/g, '').replace(/55(?=\d{10})/, '');
        if(req.body.password) user.password = sha256(req.body.password);
        writeData(data, err => {
            if(err){
                console.error(err);
                return res.sendStatus(500);
            }
            user.password = null;
            res.status(200).json(user);
        });
    }
);
router.put(
    '/users/:id',
    upload.none(),
    (req, res, next) => (req.params.id === '0') ? res.sendStatus(403) : next(),
    authenticate(true),
    fetchDocument('users', true),
    body('name').trim().notEmpty(),
    body('email').isEmail({
        allow_utf8_local_part: false,
        domain_specific_validation: true,
    }).not().contains(':'),
    body('address').trim().notEmpty(),
    body('phone').isMobilePhone('pt-BR'),
    body('password').isStrongPassword().not().contains(':').optional(),
    body('admin').equals('on').optional(),
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
        const user = data.users.find(({id}) => (id.toString() === req.params.id));
        if(user.email !== req.body.email){
            if(data.users.some(({email}) => (email === req.body.email))) return res.sendStatus(409);
            user.email = req.body.email;
        }
        user.name = req.body.name.trim();
        user.address = req.body.address.trim();
        user.phone = req.body.phone.replace(/[^\d]/g, '').replace(/55(?=\d{10})/, '');
        user.isAdmin = Boolean(req.body.admin);
        if(req.body.password) user.password = sha256(req.body.password);
        writeData(data, err => {
            if(err){
                console.error(err);
                return res.sendStatus(500);
            }
            user.password = null;
            res.status(200).json(user);
        });
    },
);
router.delete('/products/:id', authenticate(true), fetchDocument('products', true), async (req, res) => {
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
router.delete(
    '/users/:id',
    (req, res, next) => (req.params.id === '0') ? res.sendStatus(403) : next(),
    authenticate(true),
    fetchDocument('users', true),
    async (req, res) => {
        let data;
        try{
            data = await fetchData();
        }
        catch(err){
            console.error(err);
            return res.sendStatus(500);
        }
        data.users = data.users.filter(({id}) => (id.toString() !== req.params.id));
        writeData(data, err => {
            if(!err) return res.sendStatus(204);
            console.error(err);
            res.sendStatus(500);
        });
    },
);
router.get('/coffee', (_, res) => res.sendStatus(418));
router.get('/*', (_, res) => res.sendStatus(404));

export default router;
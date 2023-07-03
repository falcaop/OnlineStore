import {Router} from 'express';
import {productModel, userModel} from './db/index.js';
import {body, validationResult} from 'express-validator';
import { sha256 } from 'js-sha256';
import multer from 'multer';
import { Types } from 'mongoose';

const router = Router();
const upload = multer({
    limits: {
        fields: 20,
        files: 1,
        fileSize: 1024 * 1024,
    },
});

const authenticate = admin => async (req, res, next) => {
    const authorization = req.header('Authorization');
    if(!authorization || !authorization.startsWith('Basic ')) return res.sendStatus(401);
    const [email, password] = Buffer.from(authorization.split(' ')[1], 'base64').toString().split(':');
    req.user = await userModel.findOne({email}).select('+password');
    if(!req.user || (req.user.password !== sha256(password))) return res.sendStatus(401);
    if(admin && !req.user.isAdmin) return res.sendStatus(403);
    req.user.password = null;
    next();
}
const fetchDocument = (model, select) => async (req, res, next) => {
    if(!req.params.id.match(/^[\da-f]{24}$/)) return res.sendStatus(404);
    const documentQuery = model.findById(req.params.id);
    req.document = await (select ? documentQuery.select(select) : documentQuery);
    if(!req.document) return res.sendStatus(404);
    next();
}

router.head(
    '/authenticate',
    async (req, res, next) => await authenticate(req.query.admin === '1')(req, res, next),
    (_, res) => res.sendStatus(204),
);
router.head('/products/:id', fetchDocument(productModel, '_id'), (_, res) => res.sendStatus(204));

router.get('/products', async (req, res) => {
    if(Array.isArray(req.query.id)){
        const facet = {};
        let valid = false;
        req.query.id.forEach(id => {
            if(id.match(/^[\da-f]{24}$/)){
                facet[id] = [
                    {$match: {_id: new Types.ObjectId(id)}},
                    {$project: {image: 0}},
                ];
                valid = true;
            }
        });
        if(!valid) return res.status(200).json([]);
        const aggregatedProducts = await productModel.aggregate([{$facet: facet}]);
        const products = [];
        for(const id in facet){
            if(aggregatedProducts[0][id].length) products.push(aggregatedProducts[0][id][0]);
        }
        return res.status(200).json(products);
    }
    const filter = {};
    if(req.query.q){
        filter.name = {$regex: new RegExp(req.query.q.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')};
    }
    if(req.query.category){
        const category = parseInt(req.query.category, 10);
        if(!isNaN(category)) filter.category = category;
    }
    if(req.query.minPrice){
        const minPrice = parseInt(req.query.minPrice, 10);
        if(!isNaN(minPrice)) filter.price = {$gte: minPrice};
    }
    if(req.query.maxPrice){
        const maxPrice = parseInt(req.query.maxPrice, 10);
        if(!isNaN(maxPrice)){
            if(filter.price){
                filter.price.$lte = maxPrice;
            }
            else{
                filter.price = {$lte: maxPrice};
            }
        }
    }
    let limit = 64;
    if(req.query.limit){
        const intLimit = parseInt(req.query.limit, 10);
        if(!isNaN(intLimit)) limit = intLimit;
    }
    let sortArg = {sold: 1};
    for(const sortField of ['name', 'price', 'sold']){
        if(req.query.sortField === sortField){
            sortArg = {[sortField]: (req.query.sortOrder === '-1') ? -1 : 1};
            break;
        }
    }
    const products = await productModel.find(filter).sort(sortArg).limit(limit);
    res.status(200).json(products);
});
router.get('/products/:id', fetchDocument(productModel), (req, res) => res.status(200).json(req.document));
router.get(
    '/products/:id/image',
    fetchDocument(productModel, 'image'),
    (req, res) => (req.document.image ? res.status(200).send(req.document.image) : res.sendStatus(404)),
);
router.get('/users/me', authenticate(), (req, res) => res.status(200).json(req.user));
router.get('/users', authenticate(true), async (req, res) => {
    const filter = {email: {$ne: 'admin'}};
    if(req.query.q){
        filter.name = {$regex: new RegExp(req.query.q.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')};
    }
    switch(req.query.admin){
        case '0': filter.isAdmin = true;
        break;
        case '1': filter.isAdmin = false;
        break;
    }
    const users = await userModel.find(filter).sort({name: 1});
    res.status(200).json(users);
});
router.get('/users/me/purchases/:id', authenticate(), async (req, res) => {
    if(!req.params.id.match(/^[\da-f]{24}$/)) return res.sendStatus(404);
    await req.user.populate({
        path: 'purchases',
        match: {_id: req.params.id},
        populate: ['products', 'customs'],
    })
    if(!req.user.purchases.length) return res.sendStatus(404);
    res.status(200).json(req.user.purchases[0]);
});
router.get('/users/me/purchases', authenticate(), async (req, res) => {
    await req.user.populate({
        path: 'purchases',
        populate: ['numProducts', 'numCustoms'],
        options: {sort: {createdAt: 1}},
    })
    res.status(200).json(req.user.purchases);
});

router.post(
    '/products',
    upload.single('image'),
    authenticate(true),
    body('name').trim().isLength({
        min: 1,
        max: 1024,
    }),
    body('description').trim().isLength({max: 4096}).optional(),
    body('price').isFloat({min: 0}),
    body('category').isInt({
        min: 0,
        max: 5,
    }),
    body('stock').isInt({min: 0}).optional(),
    async (req, res) => {
        if(!validationResult(req).isEmpty()) return res.sendStatus(400);
        const product = new productModel({
            name: req.body.name.trim(),
            description: req.body.description?.trim(),
            price: Math.round(parseFloat(req.body.price) * 100) / 100,
            category: parseInt(req.body.category, 10),
            image: req.file?.buffer,
        });
        if(req.body.stock) product.stock = parseInt(req.body.stock, 10);
        await product.save();
        product.image = null;
        res.status(201).json(product);
    },
);
router.post(
    '/users',
    upload.none(),
    body('name').trim().isLength({
        min: 1,
        max: 1024,
    }),
    body('email').isEmail({allow_utf8_local_part: false}).not().contains(':'),
    body('address').trim().isLength({
        min: 1,
        max: 1024,
    }),
    body('phone').isMobilePhone('pt-BR'),
    body('password').isStrongPassword().not().contains(':'),
    body('admin').equals('on').optional(),
    async (req, res, next) => {
        if(!validationResult(req).isEmpty()) return res.sendStatus(400);
        if(req.body.admin) return await authenticate(true)(req, res, next);
        next();
    },
    async (req, res) => {
        if(await userModel.exists({email: req.body.email})) return res.sendStatus(409);
        const user = new userModel({
            email: req.body.email,
            name: req.body.name.trim(),
            address: req.body.address.trim(),
            phone: req.body.phone.replace(/[^\d]/g, '').replace(/55(?=\d{10})/, ''),
            password: sha256(req.body.password),
        });
        if(req.body.admin) user.isAdmin = true;
        await user.save();
        user.password = null;
        res.status(201).json(user);
    },
);
router.post(
    '/users/me/purchases',
    upload.none(),
    authenticate(),
    body('cardNumber').isInt({min: 0}),
    body('cardDate').isAfter(Date().toString()),
    body('cardCode').isInt({min: 0}).isLength({
        min: 3,
        max: 3,
    }),
    body('cart').toArray().isArray(),
    body('cart.*.id').isMongoId(),
    body('cart.*.amount').isInt({min: 1}).optional(),
    body('customs').toArray().isArray(),
    body('customs.*.color').toUpperCase().isIn([
        'FFFFFF',
        '808080',
        '000000',
        '000080',
        '4169E1',
        'FF0000',
        '800000',
        '228B22',
        '800080',
        'FFC0CB',
        'FFD700',
    ]).optional(),
    body('customs.*.amount').isInt({
        min: 1,
        max: 128,
    }).optional(),
    body('customs.*.image').isURL({protocols: ['http', 'https']}),
    body('customs.*.size').isInt({
        min: 0,
        max: 4,
    }),
    async (req, res) => {
        const cart = JSON.parse(req.body.cart).map(({id, amount}) => ({id, amount: amount && parseInt(amount, 10)}));
        const customs = JSON
            .parse(req.body.customs)
            .map(({color, amount, image, size}) => ({
                color: color && parseInt(color, 16),
                amount: amount && parseInt(amount, 10),
                size: parseInt(size, 10),
                image,
            }));
        if(
            !validationResult(req).isEmpty()
            ||
            (!cart.length && !customs.length)
            ||
            (customs.reduce((acc, e) => (acc + (e.amount ?? 1)), 0) > 1024)
        ) return res.sendStatus(400);
        const promises = [];
        for(const i in cart){
            const product = await productModel.findById(cart[i].id);
            if(!product) return res.status(406).json({id: cart[i].id});
            if(cart[i].amount > product.stock) return res.status(406).json({
                id: product.id,
                name: product.name,
                stock: product.stock,
            });
            product.stock -= cart[i].amount;
            product.sold += cart[i].amount;
            promises.push(product.save());
            cart[i] = {
                name: product.name,
                description: product.description,
                price: product.price,
                ...cart[i],
            };
        }
        const purchase = await req.user.addPurchase(cart, customs);
        await Promise.all(promises);
        res.status(201).json(purchase);
    },
);

router.put(
    '/products/:id',
    upload.single('image'),
    authenticate(true),
    fetchDocument(productModel, '_id'),
    body('name').trim().isLength({
        min: 1,
        max: 1024,
    }),
    body('description').trim().isLength({max: 4096}).optional(),
    body('price').isFloat({min: 0}),
    body('category').isInt({
        min: 0,
        max: 5,
    }),
    body('stock').isInt({min: 0}),
    async (req, res) => {
        if(!validationResult(req).isEmpty()) return res.sendStatus(400);
        req.document.name = req.body.name.trim(),
        req.document.description = req.body.description?.trim();
        req.document.price = Math.round(parseFloat(req.body.price) * 100) / 100;
        req.document.category = parseInt(req.body.category, 10);
        req.document.stock = parseInt(req.body.stock, 10);
        if(req.file) req.document.image = req.file.buffer;
        await req.document.save();
        req.document.image = null;
        res.status(200).json(req.document);
    },
);
router.put(
    '/users/me',
    upload.none(),
    authenticate(),
    body('name').trim().isLength({
        min: 1,
        max: 1024,
    }),
    body('email').isEmail({allow_utf8_local_part: false}).not().contains(':'),
    body('address').trim().isLength({
        min: 1,
        max: 1024,
    }),
    body('phone').isMobilePhone('pt-BR'),
    body('password').isStrongPassword().not().contains(':').optional(),
    async (req, res) => {
        if(!validationResult(req).isEmpty()) return res.sendStatus(400);
        if(req.user.email !== req.body.email){
            if(req.user.email === 'admin') return res.sendStatus(403);
            if(await userModel.exists({email: req.body.email})) return res.sendStatus(409);
        }
        const setQuery = {
            email: req.body.email,
            name: req.body.name,
            address: req.body.address,
            phone: req.body.phone,
        };
        if(req.body.password) setQuery.password = sha256(req.body.password);
        const user = await userModel.findByIdAndUpdate(req.user._id, {$set: setQuery}, {new: true});
        res.status(200).json(user);
    }
);
router.put(
    '/users/:id',
    upload.none(),
    authenticate(true),
    (req, res, next) => (req.user.email === 'admin') ? res.sendStatus(403) : next(),
    fetchDocument(userModel, 'email'),
    body('name').trim().isLength({
        min: 1,
        max: 1024,
    }),
    body('email').isEmail({allow_utf8_local_part: false}).not().contains(':'),
    body('address').trim().isLength({
        min: 1,
        max: 1024,
    }),
    body('phone').isMobilePhone('pt-BR'),
    body('password').isStrongPassword().not().contains(':').optional(),
    body('admin').equals('on').optional(),
    async (req, res) => {
        if(!validationResult(req).isEmpty()) return res.sendStatus(400);
        if((req.document.email !== req.body.email) && (await userModel.exists({email: req.body.email}))){
            return res.sendStatus(409);
        }
        req.document.email = req.body.email;
        req.document.name = req.body.name.trim();
        req.document.address = req.body.address.trim();
        req.document.phone = req.body.phone.replace(/[^\d]/g, '').replace(/55(?=\d{10})/, '');
        req.document.isAdmin = Boolean(req.body.admin);
        if(req.body.password) req.document.password = sha256(req.body.password);
        await req.document.save();
        req.document.password = null;
        res.status(200).json(req.document);
    },
);

router.delete('/products/:id', authenticate(true), fetchDocument(productModel, '_id'), async (req, res) => {
    await req.document.deleteOne();
    res.sendStatus(204);
});
router.delete(
    '/users/:id',
    authenticate(true),
    fetchDocument(userModel, '_id'),
    (req, res, next) => (req.document.email === 'admin') ? res.sendStatus(403) : next(),
    async (req, res) => {
        await req.document.deleteOne();
        res.sendStatus(204);
    },
);

router.get('/coffee', (_, res) => res.sendStatus(418));
router.get('/*', (_, res) => res.sendStatus(404));

export default router;
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

// função que retorna um middleware para autenticar o usuário atual
// recebe um boolean indicando se o usuário logado precisa ser um administrador do sistema ou não
const authenticate = admin => async (req, res, next) => {
    const authorization = req.header('Authorization');
    // caso nenhuma credencial tenha sido enviada nos headers do request responde com 401 (Unauthorized)
    if(!authorization || !authorization.startsWith('Basic ')) return res.sendStatus(401);
    // extrai o email e a senha das credenciais usando o metodo de autenticação Basic
    const [email, password] = Buffer.from(authorization.split(' ')[1], 'base64').toString().split(':');
    // procura o usuário referente ao email no banco de dados e inclui a hash da sua senha no documento retornado
    req.user = await userModel.findOne({email}).select('+password');
    // checa se a hash retornada do banco de dados é igual a hash da senha extraida das credenciais
    // caso as hashes sejam diferentes responde com 401 (Unauthorized)
    if(!req.user || (req.user.password !== sha256(password))) return res.sendStatus(401);
    // se o usuário logado precisar ser um administrador e o usuário retornado do banco de dados não for um
    // administrador responde com 403 (Forbidden)
    if(admin && !req.user.isAdmin) return res.sendStatus(403);
    // remove a hash da senha do usuário do documento passado para os próximos middlewares
    req.user.password = null;
    next();
}

// função que retorna um middleware para buscar um documento a partir de um parametro de id na URL
// recebe o model do banco de dados do qual o documento deve fazer parte e seus campos que devem ser retornados
const fetchDocument = (model, select) => async (req, res, next) => {
    // checa se o id tem o formato de ids do mongodb (24 caracteres hexadecimais)
    // caso não tenha responde com 404 (Not Found) pois é impossível que existe um documento com o id requisitado
    if(!req.params.id.match(/^[\da-f]{24}$/)) return res.sendStatus(404);
    const documentQuery = model.findById(req.params.id);
    // caso o parametro de campos não seja definido retorna todos os campos
    req.document = await (select ? documentQuery.select(select) : documentQuery);
    // caso não seja encontrado um documento com o id requisitado responde com 404 (Not Found)
    if(!req.document) return res.sendStatus(404);
    next();
}

// HEAD que implementa o middleware de autenticação
router.head(
    '/authenticate',
    async (req, res, next) => await authenticate(req.query.admin === '1')(req, res, next),
    (_, res) => res.sendStatus(204),
);
// HEAD que checa a existencia de um produto referente a um parametro de id na URL
router.head('/products/:id', fetchDocument(productModel, '_id'), (_, res) => res.sendStatus(204));

// GET que retorna uma lista de produtos filtrados e ordenado a partir de queries na URL
router.get('/products', async (req, res) => {
    // caso a query contenha uma lista de ids ignora as outras queries e busca os produtos referentes a esses ids
    if(Array.isArray(req.query.id)){
        const facet = {};
        // flag que indica que pelo menos um dos ids tem o formato de id do mongodb (24 caracteres hexadecimais)
        let valid = false;
        req.query.id.forEach(id => {
            if(id.match(/^[\da-f]{24}$/)){
                // caso o id seja válido adiciona uma facet que filtra por esse id e remove o campo de imagem do retorno
                facet[id] = [
                    {$match: {_id: new Types.ObjectId(id)}},
                    {$project: {image: 0}},
                ];
                valid = true;
            }
        });
        // caso nenhum id seja válido responde com 204 (No Content)
        if(!valid) return res.status(204).json([]);
        // retorna um aggregate de documentos referente as facets
        const aggregatedProducts = await productModel.aggregate([{$facet: facet}]);
        const products = [];
        for(const id in facet){
            // se um documento tiver sido encontrado com o id adiciona o documento a lista de produtos encontrados
            if(aggregatedProducts[0][id].length) products.push(aggregatedProducts[0][id][0]);
        }
        // caso a lista de produtos encontrados não seja vazia responde com 200 (OK) e um JSON da lista
        return res.status(products.length ? 200 : 204).json(products);
    }
    const filter = {};
    // caso a URL contenha uma query de pesquisa por nome filtra o nome por um regex que corresponde a uma string que
    // inclui a query de pesquisa (case insensitive)
    if(req.query.q){
        filter.name = {$regex: new RegExp(req.query.q.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')};
    }
    // caso a URL contenha uma query de categoria checa se é um número e se sim adiciona nos filtros
    if(req.query.category){
        const category = parseInt(req.query.category, 10);
        if(!isNaN(category)) filter.category = category;
    }
    // caso a URL contenha uma query de preço minimo checa se é um número e se sim adiciona nos filtros
    if(req.query.minPrice){
        const minPrice = parseInt(req.query.minPrice, 10);
        if(!isNaN(minPrice)) filter.price = {$gte: minPrice};
    }
    // caso a URL contenha uma query de preço máximo checa se é um número e se sim adiciona nos filtros
    if(req.query.maxPrice){
        const maxPrice = parseInt(req.query.maxPrice, 10);
        if(!isNaN(maxPrice)){
            // se o filtro por preço já existir adiciona um valor mínimo e se não cria o filtro
            if(filter.price){
                filter.price.$lte = maxPrice;
            }
            else{
                filter.price = {$lte: maxPrice};
            }
        }
    }
    let sortArg = {sold: 1};
    for(const sortField of ['name', 'price', 'sold']){
        // se a query de campo de ordenação corresponder a um dos campos de ordenação válidos altera os argumentos de
        // ordenação mapeando a query de ordem de ordenação (crescente (1) ou decrescente (-1)) e termina o loop
        if(req.query.sortField === sortField){
            sortArg = {[sortField]: (req.query.sortOrder === '-1') ? -1 : 1};
            break;
        }
    }
    let offset = 0;
    // caso a URL contenha uma query de offset checa se é um número positivo e se sim altera o offset da busca
    if(req.query.offset){
        const intOffset = parseInt(req.query.offset, 10);
        if(!isNaN(intOffset) && (intOffset > 0)) offset = intOffset;
    }
    let limit = 64;
    // caso a URL contenha uma query de limite de produtos checa se é um número e se sim altera o limite da busca
    if(req.query.limit){
        const intLimit = parseInt(req.query.limit, 10);
        if(!isNaN(intLimit)) limit = intLimit;
    }
    const products = await productModel.find(filter).sort(sortArg).skip(offset).limit(limit);
    res.status(products.length ? 200 : 204).json(products);
});
// GET que retorna os dados de um produto referente a um parametro de id na URL
router.get('/products/:id', fetchDocument(productModel), (req, res) => res.status(200).json(req.document));
// GET que retorna a imagem de um produto referente a um parametro de id na URL
router.get(
    '/products/:id/image',
    fetchDocument(productModel, 'image'),
    (req, res) => (req.document.image ? res.status(200).send(req.document.image) : res.sendStatus(404)),
);
// GET que retorna os dados do usuário logado
router.get('/users/me', authenticate(), (req, res) => res.status(200).json(req.user));
// GET que retorna uma lista de usuários filtrados a partir de queries na URL
router.get('/users', authenticate(true), async (req, res) => {
    // remove o super usuário de email "admin" do retorno pois não pode ser removido nem alterado por outros admins
    const filter = {email: {$ne: 'admin'}};
    if(req.query.q){
        filter.name = {$regex: new RegExp(req.query.q.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')};
    }
    // caso a URL contenha uma query de admin checa se é 0 ou 1 e adiciona o filtro correspondente
    switch(req.query.admin){
        case '0': filter.isAdmin = true;
        break;
        case '1': filter.isAdmin = false;
        break;
    }
    let offset = 0;
    if(req.query.offset){
        const intOffset = parseInt(req.query.offset, 10);
        if(!isNaN(intOffset) && (intOffset > 0)) offset = intOffset;
    }
    let limit = 64;
    if(req.query.limit){
        const intLimit = parseInt(req.query.limit, 10);
        if(!isNaN(intLimit)) limit = intLimit;
    }
    const users = await userModel.find(filter).sort({name: 1}).skip(offset).limit(limit);
    res.status(users.length ? 200 : 204).json(users);
});
// GET que retorna os dados de uma compra do usuário logado referente ao parametro de id na URL
// o padrão REST recomenda que endpoints tenham no máximo o formato de aninhamento /colecao/item/colecao por isso foi
// preferivel usar /purchases/:id em vez do mais especifico /users/me/purchases/:id
router.get('/purchases/:id', authenticate(), async (req, res) => {
    if(!req.params.id.match(/^[\da-f]{24}$/)) return res.sendStatus(404);
    // popula o campo virtual de compras do documento do usuário logado filtrando pelo id enviado nos parametros da URL
    await req.user.populate({
        path: 'purchases',
        match: {_id: req.params.id},
        // popula os campos virtuais de produtos e camisetas customizadas do documento de compra
        populate: ['products', 'customs'],
    });
    // caso não seja encontrado nenhuma compra com esse id referente ao usuário logado responde com 404 (Not Found)
    if(!req.user.purchases.length) return res.sendStatus(404);
    res.status(200).json(req.user.purchases[0]);
});
// GET que retorna uma lista de todas as compras do usuário logado
router.get('/users/me/purchases', authenticate(), async (req, res) => {
    let offset = 0;
    if(req.query.offset){
        const intOffset = parseInt(req.query.offset, 10);
        if(!isNaN(intOffset) && (intOffset > 0)) offset = intOffset;
    }
    let limit = 64;
    if(req.query.limit){
        const intLimit = parseInt(req.query.limit, 10);
        if(!isNaN(intLimit)) limit = intLimit;
    }
    // popula o campos virtual de compras do documento do usuário logado
    await req.user.populate({
        path: 'purchases',
        // popula os campos virtuais de quantidade de produtos e quantidade de camisetas customizadas dos documentos
        populate: ['numProducts', 'numCustoms'],
        options: {
            // ordena pelo momento em que a compras foram realizadas de forma crescente
            sort: {createdAt: 1},
            skip: offset,
            limit,
        },
    });
    res.status(req.user.purchases.length ? 200 : 204).json(req.user.purchases);
});

// POST que cria um novo produto no banco de dados a partir dos dados enviados no body do request
router.post(
    '/products',
    upload.single('image'),
    authenticate(true),
    // valida os campos do body do request
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
        // caso tenha sido encontrado algum erro no body do request responde com 400 (Bad Request)
        if(!validationResult(req).isEmpty()) return res.sendStatus(400);
        const product = new productModel({
            name: req.body.name.trim(),
            description: req.body.description?.trim(),
            // arredonda o preço para a segunda casa decimal mais próxima
            price: Math.round(parseFloat(req.body.price) * 100) / 100,
            category: parseInt(req.body.category, 10),
            image: req.file?.buffer,
        });
        if(req.body.stock) product.stock = parseInt(req.body.stock, 10);
        await product.save();
        // remove o campo de imagem do produto do objeto que será enviado como JSON na resposta do request
        product.image = null;
        // responde com 201 (Created) e o JSON do documento criado no banco de dados
        res.status(201).json(product);
    },
);
// POST que cria um novo usuário no banco de dados a partir dos dados enviados no body do request
router.post(
    '/users',
    upload.none(),
    body('name').trim().isLength({
        min: 1,
        max: 1024,
    }),
    // não permite emails que contenham o caractere ":" pois causaria problemas com a codificação das credenciais do
    // modo de autenticação Basic
    body('email').isEmail({allow_utf8_local_part: false}).not().contains(':'),
    body('address').trim().isLength({
        min: 1,
        max: 1024,
    }),
    body('phone').isMobilePhone('pt-BR'),
    // não permite senhas que contenham o caractere ":" pois causaria problemas com a codificação das credenciais do
    // modo de autenticação Basic
    body('password').isStrongPassword().not().contains(':'),
    body('admin').equals('on').optional(),
    async (req, res, next) => {
        if(!validationResult(req).isEmpty()) return res.sendStatus(400);
        // caso o request esteja tentando criar um usuário administrador checa se o usuário logado é um administrador
        if(req.body.admin) return await authenticate(true)(req, res, next);
        next();
    },
    async (req, res) => {
        // caso já exista um usuário com o email requisitado no banco de dados responde com 409 (Conflict)
        if(await userModel.exists({email: req.body.email})) return res.sendStatus(409);
        const user = new userModel({
            email: req.body.email,
            name: req.body.name.trim(),
            address: req.body.address.trim(),
            // remove os simbolos que não são digitos e o código do país do número de telefone
            phone: req.body.phone.replace(/\D/g, '').replace(/55(?=\d{10})/, ''),
            // faz uma hash da senha para salvar de forma segura no banco de dados
            password: sha256(req.body.password),
        });
        if(req.body.admin) user.isAdmin = true;
        await user.save();
        // remove o campo de hash da senha do objeto que será enviado na resposta do request
        user.password = null;
        res.status(201).json(user);
    },
);
// POST que adiciona uma nova compra do usuário logado no banco de dados a partir dos dados enviados no body do request
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
        // filtra e normaliza os campos do array de produtos do carrinho
        const cart = JSON.parse(req.body.cart).map(({id, amount}) => ({id, amount: amount && parseInt(amount, 10)}));
        // filtra e normaliza os campos do array de camisetas customizadas do carrinho
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
            // caso não haja nenhum produto nem camiseta customizada no carrinho responde com 400 (Bad Request)
            (!cart.length && !customs.length)
            ||
            // caso a quantidade total de camisetas customizadas seja maior que 1024 responde com 400 (Bad Request)
            (customs.reduce((acc, e) => (acc + (e.amount ?? 1)), 0) > 1024)
        ) return res.sendStatus(400);
        const promises = [];
        for(const i in cart){
            const product = await productModel.findById(cart[i].id);
            // caso um dos produtos do carrinho não seja encontrado no banco de dados responde com 406 (Not Acceptable)
            // e o id do produto inválido
            if(!product) return res.status(406).json({id: cart[i].id});
            // caso a quantidade de um produto do carrinho sejá maior que seu estoque responde com 406 (Not Acceptable)
            // e o estoque atual do produto
            if(cart[i].amount > product.stock) return res.status(406).json({
                id: product.id,
                name: product.name,
                stock: product.stock,
            });
            product.stock -= cart[i].amount;
            product.sold += cart[i].amount;
            promises.push(product.save());
            // adiciona os dados atuais do produto para serem registrados no documento de compra
            cart[i] = {
                name: product.name,
                description: product.description,
                price: product.price,
                ...cart[i],
            };
        }
        const purchase = await req.user.addPurchase(cart, customs);
        // salva os novos documentos de todos os produtos comprados simultaneamente
        await Promise.all(promises);
        res.status(201).json(purchase);
    },
);

// PUT que atualiza os dados de um produto referente a um parametro de id na URL
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
// PUT que atualiza os dados do usuário logado
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
            // caso seja requisitada uma atualização no email do super usuário "admin" responde com 403 (Forbidden)
            if(req.user.email === 'admin') return res.sendStatus(403);
            // caso o novo email já esteja registrado no banco de dados responde com 409 (Conflict)
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
// PUT que atualiza os dados de um usuário referente a um parametro de id na URL
router.put(
    '/users/:id',
    upload.none(),
    authenticate(true),
    // caso seja requisitada uma atualização do super usuário "admin" responde com 403 (Forbidden) pois este não pode
    // ter seus dados alterados por outros administradores
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
        req.document.phone = req.body.phone.replace(/\D/g, '').replace(/55(?=\d{10})/, '');
        req.document.isAdmin = Boolean(req.body.admin);
        if(req.body.password) req.document.password = sha256(req.body.password);
        await req.document.save();
        req.document.password = null;
        res.status(200).json(req.document);
    },
);

// DELETE que remove um produto referente a um parametro de id na URL do banco de dados
router.delete('/products/:id', authenticate(true), fetchDocument(productModel, '_id'), async (req, res) => {
    await req.document.deleteOne();
    res.sendStatus(204);
});
// DELETE que remove um usuário referente a um parametro de id na URL do banco de dados
router.delete(
    '/users/:id',
    authenticate(true),
    fetchDocument(userModel, '_id'),
    // caso seja requisitada a remoção do super usuário "admin" responde com 403 (Forbidden)
    (req, res, next) => (req.document.email === 'admin') ? res.sendStatus(403) : next(),
    async (req, res) => {
        await req.document.deleteOne();
        res.sendStatus(204);
    },
);

// GET que responde com 404 (Not Found) para qualquer GET não definido acima
router.get('/*', (_, res) => res.sendStatus(404));

export default router;
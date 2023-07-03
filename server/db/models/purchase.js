import {Schema, model} from 'mongoose';

const purchaseSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        immutable: true,
        // cria um indice para facilitar a busca por esse campo
        index: true,
        // model do banco de dados referenciado por essa chave estrangeira
        ref: 'user',
    },
}, {
    // automaticamente registra o momento de criação da compra no documento
    timestamps: true,
    // permite que os campos virtuais populados sejam stringified junto com o resto do JSON do documento
    toJSON: {virtuals: true},
});

const purchaseProductSchema = new Schema({
    purchase: {
        type: Schema.Types.ObjectId,
        required: true,
        immutable: true,
        index: true,
        ref: 'purchase',
    },
    // referencia o documento do produto original no banco de dados
    // usado principalmente para evitar a replicação da imagem do produto em cada produto de cada compra
    product: {
        type: Schema.Types.ObjectId,
        required: true,
        immutable: true,
        ref: 'product',
    },
    amount: {
        type: Number,
        default: 1,
        immutable: true,
        min: 1,
    },
    // como o produto original pode ser removido do banco de dados ou ter seus dados alterados são registrados os dados
    // de cada produto no momento em que a compra foi finalizada para garantir o funcionamento do histórico de compras
    name: {
        type: String,
        required: true,
        immutable: true,
        trim: true,
        minLength: 1,
        maxLength: 1024,
    },
    description: {
        type: String,
        trim: true,
        immutable: true,
        maxLength: 1024,
    },
    price: {
        type: Number,
        required: true,
        immutable: true,
        min: 0,
    },
});

const purchaseCustomSchema = new Schema({
    purchase: {
        type: Schema.Types.ObjectId,
        required: true,
        immutable: true,
        index: true,
        ref: 'purchase',
    },
    amount: {
        type: Number,
        default: 1,
        immutable: true,
        min: 1,
    },
    color: {
        type: Number,
        default: 0xFFFFFF,
        immutable: true,
        enum: [
            0xFFFFFF,
            0x808080,
            0x000000,
            0x000080,
            0x4169E1,
            0xFF0000,
            0x800000,
            0x228B22,
            0x800080,
            0xFFC0CB,
            0xFFD700,
        ],
    },
    image: {
        type: String,
        required: true,
        immutable: true,
        trim: true,
        // corresponde a um URL
        match: /^https?:\/\/[-\w+\.#?%/=]+\.[a-z]{2,}/,
        maxLength: 1024,
    },
    size: {
        type: Number,
        required: true,
        immutable: true,
        enum: [...["PP", "P", "M", "G", "GG"].keys()],
    },
});

// campo virtual de uma compra que retorna os produtos referentes a ela
purchaseSchema.virtual('products', {
    // model do banco de dados que contém os documentos que devem ser retornados por esse campo virtual
    ref: 'purchaseProduct',
    localField: '_id',
    // campo do documento que referencia o id da compra a que ele pertence
    foreignField: 'purchase',
});
// campo virtual de uma compra que retorna a quantidade de produtos referentes a ela
purchaseSchema.virtual('numProducts', {
    ref: 'purchaseProduct',
    localField: '_id',
    foreignField: 'purchase',
    count: true,
});
// campo virtual de uma compra que retorna as camisetas customizadas referentes a ela
purchaseSchema.virtual('customs', {
    ref: 'purchaseCustom',
    localField: '_id',
    foreignField: 'purchase',
});
// campo virtual de uma compra que retorna a quantidade de camisetas customizadas referentes a ela
purchaseSchema.virtual('numCustoms', {
    ref: 'purchaseCustom',
    localField: '_id',
    foreignField: 'purchase',
    count: true,
});

const purchaseProductModel = model('purchaseProduct', purchaseProductSchema);
const purchaseCustomModel = model('purchaseCustom', purchaseCustomSchema);

// método das instancias de compra que adiciona no banco de dados seus produtos e camisetas customizadas
purchaseSchema.method('setItems', async function(products, customs){
    await purchaseProductModel.insertMany(products.map(({id, amount, name, description, price}) => ({
        purchase: this._id,
        product: id,
        amount,
        name,
        description,
        price,
    })));
    await purchaseCustomModel.insertMany(customs.map(e => ({purchase: this._id, ...e})));
});

// middleware que remove todos os produtos e camisetas customizadas pertencentes a compras ao remover essas compras
purchaseSchema.pre('deleteMany', async function(){
    const purchaseDocuments = await this.model.find(this.getQuery()).select('_id');
    const promises = [];
    for(const purchaseDocument of purchaseDocuments){
        promises.push(
            purchaseProductModel.deleteMany({purchase: purchaseDocument._id}),
            purchaseCustomModel.deleteMany({purchase: purchaseDocument._id}),
        );
    }
    // executa a remoção de todos os produtos e camisetas customizadas simultaneamente
    await Promise.all(promises);
});

export default model('purchase', purchaseSchema);
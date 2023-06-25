import {Schema, model} from 'mongoose';

const purchaseSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        immutable: true,
        index: true,
        ref: 'user',
    },
}, {
    timestamps: true,
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

purchaseSchema.virtual('products', {
    ref: 'purchaseProduct',
    localField: '_id',
    foreignField: 'purchase',
});
purchaseSchema.virtual('numProducts', {
    ref: 'purchaseProduct',
    localField: '_id',
    foreignField: 'purchase',
    count: true,
});
purchaseSchema.virtual('customs', {
    ref: 'purchaseCustom',
    localField: '_id',
    foreignField: 'purchase',
});
purchaseSchema.virtual('numCustoms', {
    ref: 'purchaseCustom',
    localField: '_id',
    foreignField: 'purchase',
    count: true,
});

const purchaseProductModel = model('purchaseProduct', purchaseProductSchema);
const purchaseCustomModel = model('purchaseCustom', purchaseCustomSchema);

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

purchaseSchema.pre('deleteMany', async function(){
    const purchaseDocuments = await this.model.find(this.getQuery()).select('_id');
    const promises = [];
    for(const purchaseDocument of purchaseDocuments){
        promises.push(
            purchaseProductModel.deleteMany({purchase: purchaseDocument._id}),
            purchaseCustomModel.deleteMany({purchase: purchaseDocument._id}),
        );
    }
    await Promise.all(promises);
});

export default model('purchase', purchaseSchema);
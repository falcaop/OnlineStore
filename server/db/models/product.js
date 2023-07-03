import {Schema, model} from 'mongoose';

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        // cria um indice para facilitar a busca por esse campo
        index: true,
        trim: true,
        minLength: 1,
        maxLength: 1024,
    },
    description: {
        type: String,
        trim: true,
        maxLength: 4096,
    },
    price: {
        type: Number,
        required: true,
        index: true,
        min: 0,
    },
    category: {
        type: Number,
        required: true,
        index: true,
        enum: [...["Camisas", "Calças", "Vestidos", "Casacos", "Acessórios", "Calçados"].keys()],
    },
    stock: {
        type: Number,
        default: 0,
        min: 0,
    },
    sold: {
        type: Number,
        default: 0,
        min: 0,
    },
    image: {
        type: Buffer,
        // não retorna a imagem junto com o documento do produto por padrão
        select: false,
    },
});

export default model('product', productSchema);
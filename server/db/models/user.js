import { Schema, model } from "mongoose";
import purchaseModel from "./purchase.js";

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minLength: 1,
        maxLength: 1024,
    },
    name: {
        type: String,
        required: true,
        // cria um indice para facilitar a busca por esse campo
        index: true,
        trim: true,
        minLength: 1,
        maxLength: 1024,
    },
    address: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1024,
    },
    phone: {
        type: String,
        required: true,
        // corresponde a um número de telefone contendo apenas seus digitos
        match: /^[1-9]{2}9?[1-9]\d{7}$/,
    },
    password: {
        type: String,
        required: true,
        // corresponde a uma hash sha256
        match: /^[a-z\d]{64}$/,
        // não retorna o campo de hash da senha do usuário junto com seu documento por padrão
        select: false,
    },
    isAdmin: {
        type: Boolean,
        index: true,
    },
});

// campo virtual do documento de usuário que retorna suas compras
userSchema.virtual('purchases', {
    // model do banco de dados contendo os documentos que devem ser retornados por esse campo virtual
    ref: 'purchase',
    localField: '_id',
    // campo do documento que referencia o id do usuário a que ele pertence
    foreignField: 'user',
});

// método das instâncias de usuário que adiciona uma compra refente a instancia de usuário corrente
userSchema.method('addPurchase', async function(products, customs){
    const purchaseDocument = new purchaseModel({user: this._id});
    await purchaseDocument.save();
    await purchaseDocument.setItems(products, customs);
    return purchaseDocument;
});

// middleware que remove todas as compras de um usuário que será removido
userSchema.pre('deleteOne', async function(){
    await purchaseModel.deleteMany({user: this._id});
});

export default model('user', userSchema);
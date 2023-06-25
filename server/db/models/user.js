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
        match: /^[1-9]{2}9?[1-9]\d{7}$/,
    },
    password: {
        type: String,
        required: true,
        match: /^[a-z\d]{64}$/,
        select: false,
    },
    isAdmin: {
        type: Boolean,
        index: true,
    },
});

userSchema.virtual('purchases', {
    ref: 'purchase',
    localField: '_id',
    foreignField: 'user',
});

userSchema.method('addPurchase', async function(products, customs){
    const purchaseDocument = new purchaseModel({user: this._id});
    await purchaseDocument.save();
    await purchaseDocument.setItems(products, customs);
    return purchaseDocument;
});

userSchema.pre('deleteOne', async function(){
    await purchaseModel.deleteMany({user: this._id});
});

export default model('user', userSchema);
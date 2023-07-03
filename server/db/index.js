import mongoose from 'mongoose';
import productModel from './models/product.js';
import userModel from './models/user.js';
import {sha256} from 'js-sha256';

const app = mongoose.connection;

const connect = async () => await mongoose.connect(process.env.MONGOURL).catch(console.error);

app.on("error", async err => {
    console.error(err);
    await mongoose.disconnect();
});

app.on("disconnected", () => process.exit());

await connect();

// cria o super usuário "admin" caso este ainda não esteja registrado no banco de dados
if(!await userModel.exists({email: 'admin'})){
    const userDocument = new userModel({
        email: 'admin',
        name: 'admin',
        address: 'admin',
        phone: '99999999999',
        password: sha256('admin'),
        isAdmin: true,
    });
    await userDocument.save();
}

export {productModel, userModel};
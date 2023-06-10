import fs from 'fs';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';
import {sha256} from 'js-sha256';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbpath = join(__dirname, 'tempdb.json');
const imagespath = join(__dirname, 'images');
if(!fs.existsSync(dbpath)){
    fs.writeFileSync(dbpath, JSON.stringify({
        users: {
            admin: {
                name: 'admin',
                address: '',
                phone: '',
                password: sha256('admin'),
                isAdmin: true,
            },
        },
        products: [],
    }));
}
const fetchData = () => JSON.parse(fs.readFileSync(dbpath));
const writeData = data => fs.writeFileSync(dbpath, JSON.stringify(data));
const fetchImage = (id, callback) => fs.readFile(join(imagespath, id.toString()), callback);
const writeImage = (id, data) => fs.writeFile(join(imagespath, id.toString()), data, console.error);
const removeImage = id => fs.rm(join(imagespath, id.toString()), console.error);

export {fetchData, writeData, fetchImage, writeImage, removeImage};
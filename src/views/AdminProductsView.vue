<script setup>
import AdminSearch from '../components/AdminSearch.vue';
import AdminListItem from '../components/AdminListItem.vue';
import { useRoute } from 'vue-router';
import { reactive, ref, watch } from 'vue';
const route = useRoute();
const products = ref([{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}]);
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchProducts = async () => {
    await delay();
    let tmpProducts = JSON.parse(localStorage.getItem('products'));
    if(route.query.q) tmpProducts = tmpProducts.filter(e => e.name.toUpperCase().includes(route.query.q.toUpperCase()));
    if(route.query.category) tmpProducts = tmpProducts.filter(e => (e.category === parseInt(route.query.category, 10)));
    return tmpProducts;
}
watch(() => route.query, () => fetchProducts().then(res => (products.value = res)), {immediate: true});
const categories = ['categoria1', 'categoria2', 'categoria3', 'categoria4', 'categoria5', 'categoria6', 'categoria7'];
let currentProduct = null;
let newProduct = reactive({
    id: null,
    name: null,
    description: null,
    price: null,
    category: null,
    stock: null,
    image: null,
});
const showUpdateModal = id => {
    currentProduct = products.value.find(product => (product.id === id));
    for(const key in newProduct) newProduct[key] = currentProduct[key];
    modal.showModal();
};
const showAddModal = () => {
    currentProduct = null;
    for(const key in newProduct) newProduct[key] = null;
    modal.showModal();
}
const closeModal = () => modal.close();
const addItem = async () => {
    await delay();
    newProduct.id = products.value.at(-1).id + 1;
    products.value.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products.value));
    alert(`${newProduct.name} adicionado`);
};
const updateItem = async () => {
    await delay();
    for(const key in newProduct) currentProduct[key] = newProduct[key];
    localStorage.setItem('products', JSON.stringify(products.value));
    alert(`${currentProduct.name} atualizado`);
};
const deleteItem = async id => {
    currentProduct = products.value.find(product => (product.id === id));
    const confirmed = confirm(`Tem certeza que deseja deletar ${currentProduct.name}?`);
    if(!confirmed) return;
    await delay();
    products.value = products.value.filter(product => (product.id !== id));
    localStorage.setItem('products', JSON.stringify(products.value));
    alert(`${currentProduct.name} deletado`);
};
const loadImage = event => (newProduct.image = event.target.value);
</script>

<template>
    <section>
        <dialog id="modal">
            <h1>{{ currentProduct ? `Editar ${currentProduct.name}` : 'Adicionar produto' }}</h1>
            <form @submit="currentProduct ? updateItem() : addItem()" method="dialog">
                <label for="name">Nome</label>
                <br>
                <input v-model="newProduct.name" required type="text" id="name">
                <br>

                <label for="desc">Descrição</label>
                <br>
                <input v-model="newProduct.description" id="desc" type="text"/>
                <br>

                <label for="price">Preço</label>
                <br>
                <input v-model.number="newProduct.price" min="0" required step="0.01" type="number" id="price">
                <br>
                <div class="inline">
                    <label for="category">Categoria</label>
                    <label for="stock">Quantidade em estoque</label>
                </div>
                <div class="inline">
                    <select v-model.number="newProduct.category" required id="category">
                        <option v-for="(categoryName, i) in categories" :key="i" :value="i">{{ categoryName }}</option>
                    </select>
                    <input v-model.number="newProduct.stock" required min="0" type="number" id="stock">
                </div>
                <br>
                <label for="image">Imagem</label>
                <br>
                <!-- The URL text input will be replaced by a file input once we have somewhere to upload the images
                to -->
                <!-- <input @change="setImage" type="file" accept="image/png, image/jpeg" id="image"> -->
                <input @focusout="loadImage" :value="newProduct.image" type="url" id="image"/>
                <img v-if="newProduct.image" :src="newProduct.image" @error="newProduct.image = null"/>
                <br>
                <div class="inline">
                    <input type="submit" value="Confirmar">
                    <input type="button" value="Cancelar" @click.prevent.stop="closeModal"/>
                </div>
            </form>
        </dialog>
        <h1>Produtos</h1>
        <AdminSearch/>

        <div class="add">
            <i
                tabindex="0"
                @keydown.enter.space="showAddModal"
                @click="showAddModal"
                class="fa fa-plus fa-2x clickable"
            ></i>
            <br>
        </div>
        <ul>
            <hr>
            <template v-for="product in products" :key="product.id">
                <AdminListItem
                    @updateItem="showUpdateModal"
                    @deleteItem="deleteItem"
                    v-bind="product"
                />
                <hr>
            </template>
        </ul>
    </section>
</template>

<style scoped>
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
dialog{
    width: 50%;
    min-width: 250px;
    max-width: 500px;
    padding: 4vh 4vw;
    border-radius: 20px;
    border-style: none;
    max-height: 77vh;
}
dialog::backdrop{
    background-color: rgba(0, 0, 0, 0.5);
}
dialog form > *{
    margin: 20px auto;
}
ul{
    list-style: none;
    margin: 0;
    padding: 0;
}

dialog h1{
    text-align: center;
}
input[type="text"], input[type="url"]{
    width: 100%;
}
dialog form > input[type="number"]{
    width: 50%;
    transition: .3s;
}
dialog form img{
    width: 40%;
    border-radius: 10px;
    aspect-ratio: 5/6;
    object-fit: cover;
    transition: .3s;
}
.inline{
    display: flex;
    justify-content: space-between;
}
.inline > *{
    width: 48%;
}
.inline > * > input, .inline > * > select{
    width: 100%;
}

input[type="submit"], input[type="button"]{
    background-color: #2EAFBB;
    font-size: 1.2rem;
    padding: 0.7rem;
    border: none;
    color: white;
    cursor: pointer;
}

input[type="submit"]:hover, input[type="button"]:hover{
    background-color: #1c6970;
}

dialog input[type="text"], dialog input[type="number"], dialog select, dialog input[type="url"]{
    padding: 0.7rem;
    box-sizing: border-box;
}
.add{
    width: 100%;
    height: 2em;
    display: flex;
    justify-content: flex-end;
}
i{
    cursor: pointer;
    transition: .3s;
}
i:hover{
    color: #2EAFBB;
}
@media screen and (max-width: 767px) {
    dialog form img, dialog form > input[type="number"]{
        width: 100%;
    }
    dialog{
        max-width: none;
        width: calc(100% - 8vw);
        margin-bottom: 0px;
        border-radius: 0;
        padding-bottom: 0;
    }
}
</style>
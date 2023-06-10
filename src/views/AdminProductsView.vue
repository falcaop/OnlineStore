<script setup>
import AdminSearch from '../components/AdminSearch.vue';
import AdminListItem from '../components/AdminListItem.vue';
import { useRoute, useRouter } from 'vue-router';
import { reactive, ref, watch } from 'vue';

const route = useRoute();
const router = useRouter();
const apiHost = `${import.meta.env.VITE_API_HOSTNAME}:${import.meta.env.VITE_API_PORT}`;
const products = ref([{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}]);
const fetchProducts = async () => {
    const queries = {};
    if(route.query.q) queries.q = route.query.q;
    if(route.query.category) queries.category = route.query.category;
    const res = await fetch(`${apiHost}/products?${new URLSearchParams(queries)}`);
    return await res.json();
}
watch(() => route.query, async () => {
    const tmpProducts = await fetchProducts();
    tmpProducts.forEach(product => (product.image = `${apiHost}/products/${product.id}/image`));
    products.value = tmpProducts;
}, {immediate: true});
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
    document.body.style.overflowY = 'hidden';
};
const showAddModal = () => {
    currentProduct = null;
    for(const key in newProduct) newProduct[key] = null;
    modal.showModal();
    document.body.style.overflowY = 'hidden';
}
const closeModal = () => modal.close();
const addItem = async target => {
    const formData = new FormData(target);
    if(!formData.get('image').size) formData.delete('image');
    const res = await fetch(`${apiHost}/products`, {
        method: 'POST',
        headers: {Authorization: `Basic ${localStorage.getItem('credentials')}`},
        body: formData,
    });
    switch(res.status){
        case 201: {
            alert(`${newProduct.name} adicionado`);
            const product = await res.json();
            product.image = `${apiHost}/products/${product.id}/image`;
            products.value.push(product);
        }
        break;
        case 400: alert('Dados inválidos');
        break;
        case 401: {
            alert('Usuário não autenticado');
            router.push({path: '/signin'});
        }
        break;
        case 403: {
            alert('Permissões insuficientes');
            router.push({path: '/'});
        }
        break;
        default: alert('Um erro inesperado ocorreu, tente novamente mais tarde');
    }
};
const updateItem = async target => {
    const formData = new FormData(target);
    if(!formData.get('image').size) formData.delete('image');
    const res = await fetch(`${apiHost}/products/${currentProduct.id}`, {
        method: 'PUT',
        headers: {Authorization: `Basic ${localStorage.getItem('credentials')}`},
        body: formData,
    });
    switch(res.status){
        case 200: {
            alert(`${currentProduct.name} atualizado`);
            const product = await res.json();
            product.image = `${apiHost}/products/${product.id}/image`;
            for(const key in product) currentProduct[key] = product[key];
        }
        break;
        case 400: alert('Dados inválidos');
        break;
        case 401: {
            alert('Usuário não autenticado');
            router.push({path: '/signin'});
        }
        break;
        case 403: {
            alert('Permissões insuficientes');
            router.push({path: '/'});
        }
        break;
        case 404: {
            alert('Produto não encontrado');
            products.value = products.value.filter(({id}) => (id !== currentProduct.id));
        }
        break;
        default: alert('Um erro inesperado ocorreu, tente novamente mais tarde');
    }
};
const deleteItem = async id => {
    currentProduct = products.value.find(product => (product.id === id));
    if(!confirm(`Tem certeza que deseja deletar ${currentProduct.name}?`)) return;
    const res = await fetch(`${apiHost}/products/${id}`, {
        method: 'DELETE',
        headers: {Authorization: `Basic ${localStorage.getItem('credentials')}`},
    });
    switch(res.status){
        case 204: {
            alert(`${currentProduct.name} deletado`);
            products.value = products.value.filter(product => (product.id !== id));
        }
        break;
        case 401: {
            alert('Usuário não autenticado');
            router.push({path: '/signin'});
        }
        break;
        case 403: {
            alert('Permissões insuficientes');
            router.push({path: '/'});
        }
        break;
        case 404: {
            alert('Produto não encontrado');
            products.value = products.value.filter(product => (product.id !== id));
        }
        break;
        default: alert('Um erro inesperado ocorreu, tente novamente mais tarde');
    }
};
const loadImage = event => (newProduct.image = URL.createObjectURL(event.target.files[0]));
const unhideScroll = () => document.body.style.overflowY = 'unset';
</script>

<template>
    <section>
        <dialog @close="unhideScroll" id="modal">
            <h1>{{ currentProduct ? `Editar ${currentProduct.name}` : 'Adicionar produto' }}</h1>
            <form @submit="event => currentProduct ? updateItem(event.target) : addItem(event.target)" method="dialog">
                <label for="name">Nome</label>
                <br>
                <input v-model="newProduct.name" required type="text" id="name" name="name"/>
                <br>

                <label for="desc">Descrição</label>
                <br>
                <input v-model="newProduct.description" id="desc" type="text" name="description"/>
                <br>

                <label for="price">Preço</label>
                <br>
                <input
                    v-model.number="newProduct.price"
                    min="0"
                    required
                    step="0.01"
                    type="number"
                    id="price"
                    name="price"
                />
                <br>
                <div class="inline">
                    <label for="category">Categoria</label>
                    <label for="stock">Quantidade em estoque</label>
                </div>
                <div class="inline">
                    <select v-model.number="newProduct.category" required id="category" name="category">
                        <option v-for="(categoryName, i) in categories" :key="i" :value="i">{{ categoryName }}</option>
                    </select>
                    <input v-model.number="newProduct.stock" required min="0" type="number" id="stock" name="stock"/>
                </div>
                <br>
                <label for="image">Imagem</label>
                <br>
                <!-- The URL text input will be replaced by a file input once we have somewhere to upload the images
                to -->
                <input @change="loadImage" type="file" accept="image/png, image/jpeg" id="image" name="image"/>
                <!-- <input @focusout="loadImage" :value="newProduct.image" type="url" id="image"/> -->
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
    display: block;
    margin: 0;
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
    color: var(--green);
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
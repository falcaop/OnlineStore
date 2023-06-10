<script setup>
import AdminSearch from '../components/AdminSearch.vue';
import AdminListItem from '../components/AdminListItem.vue';
import { useRoute, useRouter } from 'vue-router';
import { reactive, ref, watch } from 'vue';

const route = useRoute();
const router = useRouter();
const apiHost = `${import.meta.env.VITE_API_HOSTNAME}:${import.meta.env.VITE_API_PORT}`;

const users = ref([{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}]);
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
const unhideScroll = () => document.body.style.overflowY = 'unset';
</script>

<template>
    <section>
        <dialog @close="unhideScroll" id="modal">
            <h1>{{ currentProduct ? `Editar ${currentProduct.name}` : 'Adicionar usuario' }}</h1>
            <form @submit="event => currentProduct ? updateItem(event.target) : addItem(event.target)" method="dialog">
                <label for="name">Nome</label>
                <input required type="text" id="name" name="name" @focusout="trim"/>

                <label for="email">E-mail</label>
                <input required id="email" type="email" name="email"/>

                <label for="address">Endereço</label>
                <input required type="text" id="address" name="address" @focusout="trim"/>
                <label for="phone">Telefone</label>
                <input
                    required
                    type="tel"
                    id="phone"
                    name="phone"
                    :pattern="/(?:\([1-9]{2}\)|[1-9]{2})\s?(?:9[1-9]|\d)\d{3}-?\d{4}/.source"
                />
                <div class="columns">
                    <input type="submit" value="Confirmar">
                    <input type="button" value="Cancelar" @click.prevent.stop="closeModal"/>
                </div>
            </form>
        </dialog>
        
        <h1>Usuarios</h1>
        <AdminSearch/>

        <div class="alignRight">
            <i
                tabindex="0"
                @keydown.enter.space="showAddModal"
                @click="showAddModal"
                class="fa fa-plus fa-2x clickable"
            ></i>
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
</style>
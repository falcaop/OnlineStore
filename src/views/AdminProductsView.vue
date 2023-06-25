<script setup>
import AdminSearch from '../components/AdminSearch.vue';
import AdminListItem from '../components/AdminListItem.vue';
import { useRoute, useRouter } from 'vue-router';
import { reactive, ref, watch } from 'vue';
import { fetchProducts, closeModal, unhideScroll } from '../assets/utils';

const route = useRoute();
const router = useRouter();
// valores iniciais para popular a UI enquanto os valores reais são carregados do banco
const products = ref([{_id: '0'}, {_id: '1'}, {_id: '2'}, {_id: '3'}, {_id: '4'}, {_id: '5'}, {_id: '6'}, {_id: '7'}]);
const Authorization = `Basic ${localStorage.getItem('credentials')}`;
// recarrega os produtos quando as query strings são alteradas e no carregamento inicial da página
watch(() => route.query, async () => {
    // retorna produtos da API opcionalmente usando pesquisa pelo nome e pela categoria nas query strings
    const tmpProducts = await fetchProducts({queries: route.query});
    tmpProducts.forEach(product => (product.image = `${import.meta.env.VITE_API_HOST}/products/${product._id}/image`));
    products.value = tmpProducts;
}, {immediate: true});
const categories = ["Camisas", "Calças", "Vestidos", "Casacos", "Acessórios", "Calçados"];
let currentProduct = null;
// valores dos inputs do form de adicionar/atualizar produto
const newProduct = reactive({
    _id: null,
    name: null,
    description: null,
    price: null,
    category: null,
    stock: null,
    image: null,
});
// carrega os dados do produto atual nos campos e mostra o modal com o form
const showUpdateModal = id => {
    currentProduct = products.value.find(product => (product._id === id));
    for(const key in newProduct) newProduct[key] = currentProduct[key];
    modal.showModal();
    // esconde a barra de scroll principal
    document.body.style.overflowY = 'hidden';
};
// reseta os valores dos campos e mostra o modal com o form
const showAddModal = () => {
    currentProduct = null;
    for(const key in newProduct) newProduct[key] = null;
    modal.showModal();
    document.body.style.overflowY = 'hidden';
}
// envia uma requisição de adicionar um novo produto para a API e atualiza os produtos em cache em caso de sucesso
const addItem = async target => {
    const formData = new FormData(target);
    // não envia um campo de imagem caso não tenha sido feito o upload de uma imagem
    if(!formData.get('image').size) formData.delete('image');
    const res = await fetch(`${import.meta.env.VITE_API_HOST}/products`, {
        method: 'POST',
        headers: {Authorization},
        body: formData,
    });
    switch(res.status){
        case 201: {
            alert(`${newProduct.name} adicionado`);
            const product = await res.json();
            product.image = `${import.meta.env.VITE_API_HOST}/products/${product._id}/image`;
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
// envia uma requisição para atualizar um produto para a API e atualiza os produtos em cache em caso de sucesso
const updateItem = async target => {
    const formData = new FormData(target);
    // não envia um campo de imagem caso não tenha sido feito o upload de uma imagem
    if(!formData.get('image').size) formData.delete('image');
    const res = await fetch(`${import.meta.env.VITE_API_HOST}/products/${currentProduct._id}`, {
        method: 'PUT',
        headers: {Authorization},
        body: formData,
    });
    switch(res.status){
        case 200: {
            alert(`${currentProduct.name} atualizado`);
            const product = await res.json();
            product.image = `${import.meta.env.VITE_API_HOST}/products/${product._id}/image`;
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
            // remove o produto do cache da página
            products.value.splice(products.value.findIndex(({_id}) => (_id === currentProduct._id)), 1);
        }
        break;
        default: alert('Um erro inesperado ocorreu, tente novamente mais tarde');
    }
};
// envia uma requisição para remover um produto para a API e atualiza os produtos em cache em caso de sucesso
const deleteItem = async id => {
    currentProduct = products.value.find(product => (product._id === id));
    if(!confirm(`Tem certeza que deseja deletar ${currentProduct.name}?`)) return;
    const res = await fetch(`${import.meta.env.VITE_API_HOST}/products/${id}`, {
        method: 'DELETE',
        headers: {Authorization},
    });
    switch(res.status){
        case 204: {
            alert(`${currentProduct.name} deletado`);
            products.value.splice(products.value.findIndex(({_id}) => (_id === id)), 1);
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
            products.value.splice(products.value.findIndex(({_id}) => (_id === id)), 1);
        }
        break;
        default: alert('Um erro inesperado ocorreu, tente novamente mais tarde');
    }
};
// transforma a imagem entrada por upload em um URL para mostrar a preview
const loadImage = event => (newProduct.image = URL.createObjectURL(event.target.files[0]));
</script>

<template>
    <section>
        <dialog @close="unhideScroll" id="modal">
            <h1 v-if="currentProduct">{{ `Editar ${currentProduct.name}` }}</h1>
            <h1 v-else>Adicionar produto</h1>
            <form @submit="event => currentProduct ? updateItem(event.target) : addItem(event.target)" method="dialog">
                <label for="name">Nome</label>
                <input v-model="newProduct.name" required type="text" id="name" name="name"/>
                <label for="desc">Descrição</label>
                <input v-model="newProduct.description" id="desc" type="text" name="description"/>
                <label for="price">Preço</label>
                <input
                    v-model.number="newProduct.price"
                    min="0"
                    required
                    step="0.01"
                    type="number"
                    id="price"
                    name="price"
                />
                <div class="columns">
                    <div class="left">
                        <label for="category">Categoria</label>
                        <select v-model.number="newProduct.category" required id="category" name="category">
                            <option
                                v-for="(categoryName, i) in categories"
                                :key="i"
                                :value="i"
                            >{{ categoryName }}</option>
                        </select>
                    </div>
                    <div class="right">
                        <label for="stock">Quantidade em estoque</label>
                        <input
                            v-model.number="newProduct.stock"
                            required
                            min="0"
                            type="number"
                            id="stock"
                            name="stock"
                        />
                    </div>
                </div>
                <label for="image">Imagem</label>
                <input @change="loadImage" type="file" accept="image/png, image/jpeg" id="image" name="image"/>
                <img v-if="newProduct.image" :src="newProduct.image" @error="newProduct.image = null"/>
                <div class="columns">
                    <input type="submit" value="Confirmar">
                    <input type="button" value="Cancelar" @click.prevent.stop="closeModal"/>
                </div>
            </form>
        </dialog>
        <h1>Produtos</h1>
        <AdminSearch queryName="category" :options="categories"/>

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
            <template v-for="{_id, name} in products" :key="_id">
                <AdminListItem
                    @updateItem="showUpdateModal"
                    @deleteItem="deleteItem"
                    :id="_id"
                    :name="name"
                />
                <hr>
            </template>
        </ul>
    </section>
</template>

<style scoped>
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
dialog form img{
    width: 40%;
    border-radius: 10px;
    aspect-ratio: 5/6;
    object-fit: cover;
}
</style>
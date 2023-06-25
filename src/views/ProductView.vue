<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import {toPriceString} from '../assets/utils.js';

const route = useRoute();
const product = ref({});
const cartProducts = JSON.parse(localStorage.getItem("cart")) ?? [];
const productURL = `${import.meta.env.VITE_API_HOST}/products/${route.params.id}`;
const image = `${productURL}/image`;
const cartProduct = ref();
let amount = 1;

// solicitar informacoes do produto 
const fetchProduct = async () => {
    const res = await fetch(productURL);
    return res.ok ? await res.json() : [];
}
fetchProduct().then(res => {
    product.value = res;
    // checa se o produto já está no carrinho do usuário e se sim altera a quantidade mostrada na UI
    cartProduct.value = cartProducts.find(({id}) => (id === product.value._id));
    if(cartProduct.value) amount = cartProduct.value.amount;
});

// adicionar produto e quantidade no carrinho (localStorage)
const addToCart = () => {
    alert(`${product.value.name} adicionado ao carrinho.`);
    cartProduct.value = {id: product.value._id, amount};
    cartProducts.push(cartProduct.value);
    localStorage.setItem("cart", JSON.stringify(cartProducts));
}
</script>

<template>
    <main>
        <h2>{{ product.name ?? 'Lorem Ipsum' }}</h2>
        <div class="product">
            <img class="preview" :src="image" @error="event => (event.target.src = 'https://placehold.co/500x600')"/>
            <div class="rows">
                <div>
                    <p class="price">{{ toPriceString(product.price ?? 0) }}</p>
                    <p class="description">{{ product.description ?? 'Lorem Ipsum' }}</p>
                </div>
                <div>
                    <p class="stock"><span>{{ product.stock ?? 0 }}</span> itens restantes</p>
                    <form v-if="product.stock" @submit.prevent.stop="addToCart">
                        <label for="amount">Quantidade:</label>
                        <input
                            required
                            :disabled="cartProduct"
                            class="amount"
                            type="number"
                            :max="product.stock"
                            min="1"
                            v-model="amount"
                            id="amount"
                        />
                        <button class="button inCart" v-if="cartProduct" type="button">No carrinho</button>
                        <button class="button" v-else>Adicionar ao carrinho</button>
                    </form>
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped>
.amount{
    margin-left: 1rem;
    max-width: 100px;
}
.inCart{
    cursor: default;
    background-color: darkgray;
}
.description{
    font-size: 20px;
    overflow-wrap: break-word;
}
.stock span{
    font-weight: bold;
}
.price{
    font-size: 30px;
    font-weight: bold;
    margin-top: 0;
}

.preview{
    border-radius: 10px;
    width: 40%;
    min-width: 273px;
    aspect-ratio: 5/6;
    object-fit: cover;
    background-color: #ccc;
}
@media screen and (max-width: 767px){
    .price{
        margin-top: 2rem;
    }
    .preview{
        min-width: 273px;
    } 
}
</style>
<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import utils from '../assets/utils.js';

const route = useRoute();
const product = ref({});
let amount = 1;
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchProduct = async () => {
    await delay();
    return JSON.parse(localStorage.getItem('products')).find(e => (e.id === parseInt(route.params.id, 10)));
}
fetchProduct().then(res => (product.value = res));
const addToCart = async () => {
    await delay();
    alert(`${product.value.name} adicionado ao carrinho.`);
    
    let cartProducts = JSON.parse(localStorage.getItem("cart")) ?? []
    product.value.amount = amount;
    cartProducts.push(product.value);
    localStorage.setItem("cart", JSON.stringify(cartProducts));
}
</script>

<template>
    <main>
        <h2>{{ product.name ?? 'Lorem Ipsum' }}</h2>
        <div class="container">
            <img class="preview" :src="product.image ?? 'https://placehold.co/500x600'"/>
            <div class="info">
                <div>
                    <h1 class="price">{{ utils.toPriceString(product.price ?? 0) }}</h1>
                    <p class="description">{{ product.description ?? 'Lorem Ipsum' }}</p>
                </div>
                <div>
                    <p class="stock"><span>{{ product.stock ?? 0 }}</span> itens restantes</p>
                    Quantidade<input class="amount" type="number" :max="product.stock" min="1" v-model="amount"/>
                    <button @click.prevent.stop="addToCart" class="buy">Adicionar ao carrinho</button>
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped>
main{
    width: 60%;
    margin: 65px auto;
    color: var(--black);
}
.container{
    display: flex;
    gap: 5%;
}
.preview{
    border-radius: 10px;
    width: 40%;
    min-width: 273px;
    aspect-ratio: 5/6;
    object-fit: cover;
    background-color: #ccc;
}
.amount{
    margin-left: 10px;
    height: 30px;
    border: none;
    max-width: 100px;
}
.buy{
    display: block;
    margin-top: 20px;
    border: none;
    background-color: var(--green);
    color: white;
    padding: 15px 0;
    width: 100%;
    cursor: pointer;
}
.buy:hover, .buy:focus{
    background-color: var(--green-active);
}
.info{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 55%;
    min-width: 273px;
}
.stock span{
    font-weight: bold;
}
.description{
    font-size: 20px;
    overflow-wrap: break-word;
}
.price{
    margin-top: 0;
}
@media screen and (max-width: 816px){
    .container{
        gap: 30px;
        flex-direction: column;
    }
    .preview, .info{
        width: 100%;
        min-width: 0;
        max-width: 273px;
    }
}
</style>
<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const product = ref({});
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchProduct = async () => {
    await delay();
    return JSON.parse(localStorage.getItem('products')).find(e => (e.id === parseInt(route.params.id, 10)));
}
fetchProduct().then(res => (product.value = res));
const addToCart = async () => {
    await delay();
    alert(`adicionar ${product.value.name} ao carrinho`);
}
</script>

<template>
    <main>
        <h2>{{ product.name ?? 'Lorem Ipsum' }}</h2>
        <div class="container">
            <img class="preview" :src="product.image ?? 'https://placehold.co/500x600'"/>
            <div class="info">
                <div>
                    <h1 class="price">R$ {{ product.price ?? '0.00' }}</h1>
                    <p class="description">{{ product.description ?? 'Lorem Ipsum' }}</p>
                </div>
                <div>
                    <p class="stock"><span>{{ product.stock ?? 0 }}</span> itens restantes</p>
                    Quantidade<input class="amount" type="number" value="1" min="1"/>
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
    color: #27292C;
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
    background-color: #2EAFBB;
    color: white;
    padding: 15px 0;
    width: 100%;
    cursor: pointer;
}
.buy:hover, .buy:focus{
    background-color: #298992;
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
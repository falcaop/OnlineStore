<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ItemCart from '../components/ItemCart.vue';

const products = ref([]);
const router = useRouter();
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchProducts = async () => {
    await delay();
    return JSON.parse(localStorage.getItem('cart'));
}
fetchProducts().then(res => (products.value = res));

const empty = () =>{
    if (confirm("Tem certeza que deseja esvaziar o carrinho?")){
        products.value = []
        localStorage.removeItem('cart');
    }   
}
const remove = (id) => {
    if (confirm("Tem certeza que deseja remover o produto do carrinho?")){
        let i = products.value.findIndex((p) => p.id === id);
        products.value.splice(i, 1);
        localStorage.setItem("cart", JSON.stringify(products.value));
    }
}

const changeAmount = (id, amount) => {
    products.value.find((p) => p.id === id).amount = amount;
    localStorage.setItem("cart", JSON.stringify(products.value));
}

const finalizar = () => {
    router.push({path: '/'});
}

const total = 100.01;
</script>

<template>
    <main>
        <h2>Meu carrinho</h2>
        <div class="container">
            <div v-if="products">
                <div class="empty">
                    <a class="clickable" @click.prevent.stop="empty()" >Esvaziar carrinho</a>
                </div>
                <hr>
                <ItemCart v-for="product in products" :key="product.id" v-bind="product" class="cartItem" @removeItem="remove" @amountChanged="changeAmount" />
                <div class="total">
                    <p>Total: <strong> R$ {{ total }}</strong></p>
                    <input type="button" class="clickable" value="Finalizar compra" @click.prevent.stop="finalizar()">
                </div>
            </div>
            <div v-else>Nenhum produto no carrinho</div>
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
    background-color: white;
    margin: auto;
    width: 100%;
    padding: 4%;
    border-radius: 20px;
}

.cartItem{
    width: 100%;
    margin: 20px 0 0 0;
}
.empty, .total{
    display: flex;
    align-items: flex-end;
    flex-direction: column;
}

.total > p{
    font-size: 1.3rem;
}

input[type="button"]{
    width: 50%;
    background-color: var(--green);
    font-size: 1.2rem;
    padding: 0.7rem;
    border: none;
    color: white;
    min-width: 200px;
}

input[type="button"]:hover{
    background-color: var(--green-active);
}

.clickable:hover{
    cursor: pointer;
}

@media screen and (max-width: 1023px) {
    .container{
        padding: 8%;
    }
}

@media screen and (max-width: 767px) {
    .container{
        padding: 10%;
    }
}
</style>
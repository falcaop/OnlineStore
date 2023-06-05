<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import ItemCart from '../components/ItemCart.vue';
import utils from '../assets/utils.js';

const router = useRouter();
const cartProducts = ref(JSON.parse(localStorage.getItem('cart')) ?? []);
let products = [];
const totalPriceString = ref('');
const findProduct = id => products.find(product => (product.id === id));
const updateTotalPriceString = () => {
    totalPriceString.value = utils.toPriceString(
        cartProducts.value.reduce(
            (acc, {id, amount}) => (acc + (findProduct(id).price * amount)),
            0,
        ),
    );
}
watch(
    cartProducts,
    updateTotalPriceString,
);
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchProducts = async () => {
    await delay();
    return JSON
        .parse(localStorage.getItem('products'))
        .filter(product => cartProducts.value.some(({id}) => (product.id === id)));
}
fetchProducts().then(res => {
    products = res;
    updateTotalPriceString();
});
const empty = () =>{
    if (confirm("Tem certeza que deseja esvaziar o carrinho?")){
        cartProducts.value = [];
        localStorage.removeItem('cart');
    }   
}
const remove = (id) => {
    cartProducts.value = cartProducts.value.filter(product => (product.id !== id));
    localStorage.setItem("cart", JSON.stringify(cartProducts.value));
}

const changeAmount = (id, amount) => {
    cartProducts.value.find((p) => p.id === id).amount = amount;
    localStorage.setItem("cart", JSON.stringify(cartProducts.value));
    updateTotalPriceString();
}

const finalizar = () => {
    router.push({path: '/'});
}

</script>

<template>
    <main>
        <h2>Meu carrinho</h2>
        <div class="container">
            <div v-if="cartProducts.length && totalPriceString">
                <div class="empty">
                    <a
                        tabindex="0"
                        class="clickable"
                        @click.prevent.stop="empty()"
                        @keyup.enter.space="empty()"
                    >Esvaziar carrinho</a>
                </div>
                <hr>
                <ItemCart
                    v-for="{id, amount} in cartProducts"
                    :key="id"
                    v-bind="products.find(product => (product.id === id))"
                    :amount="amount"
                    class="cartItem"
                    @removeItem="remove"
                    @amountChanged="changeAmount"
                />
                <div class="total">
                    <p>Total: <strong>{{ totalPriceString }}</strong></p>
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
.clickable{
    transition: .3s;
}
.clickable:hover{
    cursor: pointer;
    color: var(--green);
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
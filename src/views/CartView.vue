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

const payment = () => {
    router.push({path: '/payment'});
}

</script>

<template>
    <main>
        <h2>Meu carrinho</h2>
        <div class="container">
            <div v-if="cartProducts.length && totalPriceString">
                <div class="alignRight">
                    <a  
                        class="empty"
                        tabindex="0"
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
                <div class="alignRight">
                    <p class="total">Total: <strong>{{ totalPriceString }}</strong></p>
                    <input type="button" value="Realizar pagamento" @click.prevent.stop="payment()">
                </div>
            </div>
            <div v-else>Nenhum produto no carrinho</div>
        </div>
    </main>
</template>

<style scoped>
input[type="button"]{
    width: 50%;
    margin-top: 0;
}
.cartItem{
    width: 100%;
    margin: 1.5rem 0 0 0;
}
.empty{
    transition: .3s;
    cursor: pointer;
}
.empty:hover{
    color: var(--green);
}
.total{
    font-size: 1.3rem;
}
@media screen and (max-width: 767px) {
    input[type="button"]{
        width: 100%;
    }
}
</style>
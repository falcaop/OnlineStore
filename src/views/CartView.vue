<script setup>
import { ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import ItemCart from '../components/ItemCart.vue';
import utils from '../assets/utils.js';

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
watch(cartProducts, updateTotalPriceString);
const fetchProducts = async () => {
    const res = await fetch(
        `${import.meta.env.VITE_API_HOSTNAME}:${import.meta.env.VITE_API_PORT}/products?` +
        cartProducts.value.map(({id}) => `id=${id}`).join('&')
    );
    return await res.json();
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
                    <RouterLink to="/payment">Realizar pagamento</RouterLink>
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
    box-sizing: border-box;
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
.empty a{
    transition: .3s;
}
.empty a:hover{
    color: var(--green);
}

.total > p{
    font-size: 1.3rem;
}

.total a{
    width: 50%;
    background-color: var(--green);
    font-size: 1.2rem;
    padding: 0.7rem;
    border: none;
    color: white;
    min-width: 200px;
    text-align: center;
}

.total a:hover{
    background-color: var(--green-active);
}
.clickable:hover{
    cursor: pointer;
}
@media screen and (max-width: 1024px) {
    .container{
        padding: 4% 8%;
    }
    main{
        width: 70%;
    }
}

@media screen and (max-width: 768px) {
    .container{
        padding: 4% 10%;
    }
}
@media (max-width: 480px){
    main{
        width: 80%;
    }
}
</style>
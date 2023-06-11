<script setup>
import { ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import ItemCart from '../components/ItemCart.vue';
import utils from '../assets/utils.js';

// itens do carrinho (id do produto e quantidade)
const cartProducts = ref(JSON.parse(localStorage.getItem('cart')) ?? []);

const totalPriceString = ref('');
let products = [];
const findProduct = id => products.find(product => (product.id === id));
// atualizar o valor total da compra
const updateTotalPriceString = () => {
    totalPriceString.value = utils.toPriceString(
        cartProducts.value.reduce(
            (acc, {id, amount}) => (acc + (findProduct(id).price * amount)),
            0,
        ),
    );
}
watch(cartProducts, updateTotalPriceString);

// solicitar informacoes dos produtos no carrinho
const fetchProducts = async () => {
    const res = await fetch(
        `${import.meta.env.VITE_API_HOST}/products?${cartProducts.value.map(({id}) => `id=${id}`).join('&')}`
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
                <div class="total">
                    <p>Total: <strong>{{ totalPriceString }}</strong></p>
                    <RouterLink class="link" to="/payment">Realizar pagamento</RouterLink>
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
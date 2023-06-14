<script setup>
import { ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import ItemCart from '../components/ItemCart.vue';
import {fetchProducts, calcTotalPriceString} from '../assets/utils.js';

// itens do carrinho (id do produto e quantidade)
const cartProducts = ref(JSON.parse(localStorage.getItem('cart')) ?? []);
const customProducts = ref(JSON.parse(localStorage.getItem('customs')) ?? []);

const totalPriceString = ref('');
let products = [];

// atualiza o preço total quando algum produto é removido
watch(
    [cartProducts, customProducts],
    () => (totalPriceString.value = calcTotalPriceString(cartProducts.value, products, customProducts.value)),
);

fetchProducts({ids: cartProducts.value.map(({id}) => id)}).then(res => {
    products = res;
    totalPriceString.value = calcTotalPriceString(cartProducts.value, products, customProducts.value);
});

const empty = () =>{
    if (confirm("Tem certeza que deseja esvaziar o carrinho?")){
        cartProducts.value = [];
        customProducts.value = [];
        localStorage.removeItem('cart');
        localStorage.removeItem('customs');
    }   
}
const remove = (id) => {
    cartProducts.value = cartProducts.value.filter(product => (product.id !== id));
    localStorage.setItem("cart", JSON.stringify(cartProducts.value));
}
const removeCustom = (id) => {
    customProducts.value = customProducts.value.filter(product => (product.id !== id));
    localStorage.setItem("customs", JSON.stringify(customProducts.value));
}

const changeAmount = (id, amount) => {
    cartProducts.value.find((p) => p.id === id).amount = amount;
    localStorage.setItem("cart", JSON.stringify(cartProducts.value));
    totalPriceString.value = calcTotalPriceString(cartProducts.value, products, customProducts.value);
}
const changeAmountCustom = (id, amount) => {
    customProducts.value.find((p) => p.id === id).amount = amount;
    localStorage.setItem("customs", JSON.stringify(customProducts.value));
    totalPriceString.value = calcTotalPriceString(cartProducts.value, products, customProducts.value);
}
</script>

<template>
    <main>
        <h2>Meu carrinho</h2>
        <div class="container">
            <div v-if="(cartProducts.length || customProducts.length) && totalPriceString">
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
                <ItemCart
                    v-for="{id, amount, image, size, color} in customProducts"
                    :key="id"
                    :id="id"
                    name="Camisa customizada"
                    :stock="Infinity"
                    :price="50"
                    :amount="amount"
                    :preview="image"
                    :size="size"
                    :color="color"
                    class="cartItem"
                    @removeItem="removeCustom"
                    @amountChanged="changeAmountCustom"
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
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

fetchProducts({
    ids: (
        (cartProducts.value.length > 1)
        ? cartProducts.value.map(({id}) => id)
        : cartProducts.value.map(({id}) => id).concat(Array(2 - cartProducts.value.length).fill(''))
    ),
}).then(res => {
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
    cartProducts.value.splice(cartProducts.value.findIndex(product => (product.id === id)));
    localStorage.setItem("cart", JSON.stringify(cartProducts.value));
}
const removeCustom = (id) => {
    customProducts.value.splice(customProducts.value.findIndex(product => (product.id === id)));
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
const findProduct = id => {
    const {_id, name, stock, price} = products.find(product => (product._id === id));
    return {id: _id, name, stock, price};
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
                    v-bind="findProduct(id)"
                    :amount="amount"
                    class="cartItem"
                    @removeItem="remove"
                    @amountChanged="changeAmount"
                />
                <ItemCart
                    v-for="{id, amount, image, size, color} in customProducts"
                    :key="id.toString()"
                    :id="id"
                    name="Camisa customizada"
                    :stock="100"
                    :price="50"
                    :amount="amount"
                    :preview="image"
                    :size="['PP', 'P', 'M', 'G', 'GG'][size]"
                    :color="`#${color.toString(16).padStart(6, '0')}`"
                    class="cartItem"
                    @removeItem="removeCustom"
                    @amountChanged="changeAmountCustom"
                />
                <div class="total">
                    <p>Total: <strong>{{ totalPriceString }}</strong></p>
                    <RouterLink class="button" to="/payment">Realizar pagamento</RouterLink>
                </div>
            </div>
            <div v-else>Nenhum produto no carrinho</div>
        </div>
    </main>
</template>

<style scoped>
.button{
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
    display: flex;
    flex-direction: column;
    align-items: end;
}
@media screen and (max-width: 767px) {
    .total{
        align-items: start;
    }
    .button{
        width: 100%;
    }
}
</style>
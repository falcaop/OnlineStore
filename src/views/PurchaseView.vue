<script setup>
import { ref } from 'vue';
import ItemCart from '../components/ItemCart.vue';
import {fetchProducts, calcTotalPriceString} from '../assets/utils.js';
import { useRoute } from 'vue-router';

const route = useRoute();
const purchase = ref({
    id: 0,
    date: 0,
    products: [],
    customs: [],
});
let products = [];
const totalPriceString = ref('');

// envia uma requisição dos dados da compra para a API
const fetchPurchase = async () => {
    const res = await fetch(
        `${import.meta.env.VITE_API_HOST}/purchases/${route.params.id}`,
        {headers: {Authorization: `Basic ${localStorage.getItem('credentials')}`},
    });
    return res.ok ? await res.json() : {};
}

fetchPurchase().then(async res => {
    purchase.value = res;
    // envia uma requisição dos dados dos produtos presentes nessa compra para a API e atualiza o preço total
    products = await fetchProducts({ids: purchase.value.products.map(({id}) => id)}); 
    totalPriceString.value = calcTotalPriceString(purchase.value.products, products, purchase.value.customs);
});
</script>

<template>
    <main>
        <h2>Relatorio da compra</h2>
        <div class="container">
            <div v-if="totalPriceString"> 
                <div>
                    Compra finalizada em {{ new Date(purchase.date).toLocaleDateString() }}
                </div>
                <hr>

                <ItemCart
                    v-for="{id, amount} in purchase.products"
                    :key="id"
                    v-bind="products.find(product => (product.id === id))"
                    :amount="amount"
                    class="cartItem"
                    :purchase="true"
                />
                <ItemCart
                    v-for="{id, amount, image, size, color} in purchase.customs"
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
                    :purchase="true"
                />
                <div class="alignRight">
                    <p class="total">Total: <strong>{{ totalPriceString }}</strong></p>
                </div>
            </div>
            <div v-else>Compra nao encontrada</div>
        </div>
    </main>
</template>

<style scoped>
.cartItem{
    width: 100%;
    margin: 1.5rem 0 0 0;
}

.total{
    font-size: 1.3rem;
}
</style>
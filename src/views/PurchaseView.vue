<script setup>
import { ref } from 'vue';
import ItemCart from '../components/ItemCart.vue';
import utils from '../assets/utils.js';
import { useRoute } from 'vue-router';

const route = useRoute();
const purchase = ref({
    id: 0,
    date: 0,
    products: [],
});
let products = [];
const totalPriceString = ref('');

const fetchPurchase = async () => {
    const res = await fetch(
        `${import.meta.env.VITE_API_HOST}/purchases/${route.params.id}`,
        {headers: {Authorization: `Basic ${localStorage.getItem('credentials')}`},
    });
    return res.ok ? await res.json() : {};
}

const fetchProducts = async () => {
    const res = await fetch(
        `${import.meta.env.VITE_API_HOST}/products?${purchase.value.products.map(({id}) => `id=${id}`).join('&')}`
    );
    return res.ok ? await res.json() : [];
}

const findProduct = id => products.find(product => (product.id === id));
const updateTotalPriceString = () => {
    totalPriceString.value = utils.toPriceString(
        purchase.value.products.reduce(
            (acc, {id, amount}) => (acc + (findProduct(id).price * amount)),
            0,
        ),
    );
}

fetchPurchase().then(async res => {
    purchase.value = res;
    products = await fetchProducts(); 
    updateTotalPriceString();
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
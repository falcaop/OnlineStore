<script setup>
import { ref } from 'vue';
import ItemCart from '../components/ItemCart.vue';
import {toPriceString} from '../assets/utils.js';
import { useRoute } from 'vue-router';

const route = useRoute();
const purchase = ref({
    id: 0,
    date: 0,
    products: [],
    customs: [],
});
const totalPriceString = ref('');

// envia uma requisição dos dados da compra para a API
const fetchPurchase = async () => {
    const res = await fetch(
        `${import.meta.env.VITE_API_HOST}/users/me/purchases/${route.params.id}`,
        {headers: {Authorization: `Basic ${localStorage.getItem('credentials')}`},
    });
    return res.ok ? await res.json() : {};
}

fetchPurchase().then(async res => {
    purchase.value = res;
    totalPriceString.value = toPriceString(
        purchase.value.products.reduce((acc, {amount, price}) => (acc + (price * amount)), 0)
        +
        purchase.value.customs.reduce((acc, {amount}) => (acc + (50 * amount)), 0),
    );
});
</script>

<template>
    <main>
        <h2>Relatorio da compra</h2>
        <div class="container">
            <div v-if="totalPriceString"> 
                <div>
                    Compra finalizada em {{ new Date(purchase.createdAt).toLocaleDateString() }}
                </div>
                <hr>

                <ItemCart
                    v-for="{product, name, price, amount} in purchase.products"
                    :key="product"
                    :id="product"
                    :name="name"
                    :price="price"
                    :amount="amount"
                    :purchase="true"
                    class="cartItem"
                />
                <ItemCart
                    v-for="{_id, amount, image, size, color} in purchase.customs"
                    :key="_id"
                    :id="_id"
                    name="Camisa customizada"
                    :price="50"
                    :amount="amount"
                    :preview="image"
                    :size="['PP', 'P', 'M', 'G', 'GG'][size]"
                    :color="`#${color.toString(16).padStart(6, '0')}`"
                    :purchase="true"
                    class="cartItem"
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
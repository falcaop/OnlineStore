<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import ItemCart from '../components/ItemCart.vue';
import utils from '../assets/utils.js';
import { useRoute } from 'vue-router';

const route = useRoute();
const purchase = ref({});
let products = [];

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchPurchase= async () => {
    await delay();
    return JSON.parse(localStorage.getItem('purchases')).find(e => (e.id === parseInt(route.params.id, 10)));
}
fetchPurchase().then(res => {
    purchase.value = res;
});

const totalPriceString = ref('');
const findProduct = id => products.find(product => (product.id === id));
const updateTotalPriceString = () => {
    totalPriceString.value = utils.toPriceString(
        purchase.value.products.reduce(
            (acc, {id, amount}) => (acc + (findProduct(id).price * amount)),
            0,
        ),
    );
}

const fetchProducts = async () => {
    await delay();
    return JSON
        .parse(localStorage.getItem('products'))
        .filter(product => purchase.value.products.some(({id}) => (product.id === id)));
}
fetchProducts().then(res => {
    products = res;
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
                <div class="total">
                    <p>Total: <strong>{{ totalPriceString }}</strong></p>
                </div>
            </div>
            <div v-else>Compra nao encontrada</div>
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

.total > p{
    font-size: 1.3rem;
}

.total{
    display: flex;
    justify-content: flex-end;
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
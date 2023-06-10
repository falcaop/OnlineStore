<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import ProductCard from '../components/ProductCard.vue';

const products = ref([{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}]);
const fetchProducts = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_HOSTNAME}:${import.meta.env.VITE_API_PORT}/products`);
    return await res.json();
}
fetchProducts().then(res => (products.value = res));
</script>

<template>
    <main>
        <section class="featured">
            <RouterLink to="/customise">
                <img class="banner" src="../assets/featuredmockup.png" />
            </RouterLink>
        </section>

        <section class="products">
                <ProductCard class="card" v-for="product in products" :key="product.id" v-bind="product" />  
        </section>
    </main>
</template>

<style scoped>
main {
    width: 70%;
    margin: auto;
}

.featured {
    background-color: #3A3D41;
    aspect-ratio: 16/5;
}

.banner {
    width: 100%;
}

.products {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    width: 100%;
    gap: 1rem;
}

.products .card {
    width: 20%;
    min-width: 125px;
    margin: 2rem 0 0;
}

@media screen and (max-width: 800px) {
    .products .card{
        width: 45%;
    }
}
</style>
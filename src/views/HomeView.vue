<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import ProductCard from '../components/ProductCard.vue';
import { fetchProducts } from '../assets/utils';

const products = ref([{}, {}, {}, {}]);

// solicitar informacoes dos 4 produtos mais vendidos
fetchProducts({
    queries: {
        sortField: 'sold',
        sortOrder: -1,
        limit: 4,
    }
}).then(res => (products.value = res));

</script>

<template>
    <main>
        <section class="featured">
            <RouterLink to="/customize">
                <img class="banner" src="../assets/banner.png" />
            </RouterLink>
        </section>

        <section class="products">
                <ProductCard class="card" v-for="product in products" :key="product._id" :id="product._id" :name="product.name" :price="product.price" />  
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
    min-height: 150px;
}

.featured img{
    display: block;
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

@media screen and (max-width: 767px){
    main{
        width: 100%;
    }
    .products{
        width: 70%;
        margin: auto;
    }
    main{
        overflow: hidden;
    }
}

@media screen and (max-width: 400px){
    .featured{
        position: relative;
        left: -7%;
    }
}


</style>
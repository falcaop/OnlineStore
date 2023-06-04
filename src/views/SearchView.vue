<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProductCard from '../components/ProductCard.vue';
import utils from '../assets/utils.js';

const route = useRoute();
const router = useRouter();
const products = ref([{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }]);
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchProducts = async (sort = (a, b) => a.name.localeCompare(b.name)) => {
    await delay();
    let tmpProducts = JSON.parse(localStorage.getItem('products')).toSorted(sort);
    if(route.query.q) tmpProducts = tmpProducts.filter(e => e.name.toUpperCase().includes(route.query.q.toUpperCase()));
    if(route.query.category) tmpProducts = tmpProducts.filter(e => (e.category === parseInt(route.query.category, 10)));
    if(route.query.minPrice) tmpProducts = tmpProducts.filter(e => (e.price >= parseFloat(route.query.minPrice, 10)));
    if(route.query.maxPrice) tmpProducts = tmpProducts.filter(e => (e.price <= parseFloat(route.query.maxPrice, 10)));
    return tmpProducts;
}
watch(() => route.query, async () => (products.value = await fetchProducts()), { immediate: true });
const categories = ['categoria1', 'categoria2', 'categoria3', 'categoria4', 'categoria5', 'categoria6', 'categoria7'];
const prices = [
    {
        minPrice: null,
        maxPrice: 50,
    },
    {
        minPrice: 50,
        maxPrice: 100,
    },
    {
        minPrice: 100,
        maxPrice: 200,
    },
    {
        minPrice: 200,
        maxPrice: null,
    },
];
const sortProducts = async event => {
    switch (event.target.value) {
        case "0":
            products.value = await fetchProducts();
            break;
        case "1":
            products.value = await fetchProducts((a, b) => a.price - b.price);
            break;
        case "2":
            products.value = await fetchProducts((a, b) => b.price - a.price);
            break;
        case "3":
            products.value = await fetchProducts((a, b) => a.stock - b.stock);
            break;
    }
}
const filterProducts = ({
    category = (route.query.category ?? null),
    minPrice = (route.query.minPrice ?? null),
    maxPrice = (route.query.maxPrice ?? null),
}) => {
    const query = {};
    if(category !== null) query.category = category;
    if(minPrice !== null) query.minPrice = minPrice;
    if(maxPrice !== null) query.maxPrice = maxPrice;
    if(route.query.q) query.q = route.query.q;
    router.push({path: '/search', query});
}
const searchURL = ({
    category = (route.query.category ?? null),
    minPrice = (route.query.minPrice ?? null),
    maxPrice = (route.query.maxPrice ?? null),
}) => {
    const queries = {};
    if(category !== null) queries.category = category;
    if(minPrice !== null) queries.minPrice = minPrice;
    if(maxPrice !== null) queries.maxPrice = maxPrice;
    if(route.query.q) queries.q = route.query.q;
    return `/search?${new URLSearchParams(queries)}`;
}
const isCurrentPrice = ({minPrice, maxPrice}) => {
    return (
        (minPrice === (route.query.minPrice ? parseFloat(route.query.minPrice, 10) : null))
        &&
        (maxPrice === (route.query.maxPrice ? parseFloat(route.query.maxPrice, 10) : null))
    );
}
</script>

<template>
    <main>
        <h2 v-if="$route.query.q">Resultados da pesquisa: "{{ route.query.q }}"</h2>
        <h2 v-if="$route.query.category">{{ categories[route.query.category] }}</h2>

        <div class="results">
            <section class="filters">
                <strong>Ordenar por</strong>
                <select @change="sortProducts">
                    <option selected value="0">A-Z</option>
                    <option value="1">Menor preco</option>
                    <option value="2">Maior preco</option>
                    <option value="3">Mais vendidos (nao funciona)</option>
                </select>
                <hr>

                <strong>Filtrar por</strong>
                <p>Preço</p>
                <a
                    v-for="price in prices"
                    :href="searchURL(price)"
                    @click.prevent.stop="filterProducts(price)"
                    :class="isCurrentPrice(price) ? 'active' : ''"
                >{{ utils.priceDescription(price) }}</a>

                <p>Categoria</p>
                <a
                    :class="!$route.query.category ? 'active' : ''"
                    :href="searchURL({category: null})"
                    @click.prevent.stop="filterProducts({category: null})"
                >Todas</a>
                <a
                    v-for="(category, i) in categories"
                    :key="i"
                    :href="searchURL({category: i})"
                    @click.prevent.stop="filterProducts({category: i})"
                    :class="($route.query.category === i.toString()) ? 'active' : ''"
                >{{ category }}</a>

            </section>

            <section class="products">
                <p> {{ products.length }} produto(s) encontrado(s).</p>

                <ProductCard class="card" v-for="product in products" :key="product.id" v-bind="product" />
            </section>
        </div>

    </main>
</template>

<style scoped>
main {
    width: 60%;
    margin: 65px auto;
    color: var(--black);
}

p {
    margin-top: 2em;
    font-weight: bold;
}

strong {
    font-size: large;
}

a {
    display: block;
    margin: 0.75em 0;
}

a:hover {
    cursor: pointer;
}

select {
    margin: 5% 0;
    width: 100%;
}

.results {
    display: flex;
    align-items: start;
    gap: 30px;
}

.filters {
    flex: 20%;
}
.filters a{
    transition: .3s;
}
.filters a:hover, .filters a.active{
    color: var(--green);
}

.products {
    flex: 80%;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    width: 100%;
    gap: 10px;
}

.products .card {
    width: 30%;
    min-width: 125px;
    margin: 2% 0;
}

.products>p {
    width: 100%;
    margin: 0;
}

hr {
    color: var(--black-active);
    background-color: var(--black-active);
    margin: 1em 0;
    height: 1px;
    border: none;
}

@media screen and (max-width: 767px) {
    .results {
        display: block;
    }

    .products {
        margin-top: 5em;
    }
}

@media screen and (max-width: 450px) {
    .products .card {
        min-width: 100%;
    }
}
</style>
<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProductCard from '../components/ProductCard.vue';
import utils from '../assets/utils.js';

const route = useRoute();
const router = useRouter();
const products = ref([{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }]);
const sortMethods = {
    nameAsc: {
        description: 'A-Z',
        info: {
            field: 'name',
            order: 1,
        },
    },
    priceAsc: {
        description: 'Menor preço',
        info: {
            field: 'price',
            order: 1,
        },
    },
    priceDesc: {
        description: 'Maior preço',
        info: {
            field: 'price',
            order: -1,
        },
    },
    soldDesc: {
        description: 'Mais vendidos (temporariamente maior estoque)',
        info: {
            field: 'stock',
            order: -1,
        },
    },
};
let sortMethod = ref('nameAsc');
const fetchProducts = async () => {
    const queries = {
        sortField: sortMethods[sortMethod.value].info.field,
        sortOrder: sortMethods[sortMethod.value].info.order,
    };
    for(const query of ['q', 'category', 'minPrice', 'maxPrice']){
        if(route.query[query]) queries[query] = route.query[query];
    }
    const res = await fetch(
        `${import.meta.env.VITE_API_HOSTNAME}:${import.meta.env.VITE_API_PORT}/products?${new URLSearchParams(queries)}`
    );
    return await res.json();
}
watch([() => route.query, sortMethod], async () => (products.value = await fetchProducts()), { immediate: true });
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
const priceDescription = ({minPrice, maxPrice}) => {
    if(!minPrice) return `Até ${utils.toPriceString(maxPrice)}`;
    return (
        maxPrice
        ? `Entre ${utils.toPriceString(minPrice)} e ${utils.toPriceString(maxPrice)}`
        : `Maior que ${utils.toPriceString(minPrice)}`
    );
}
</script>

<template>
    <main>
        <h2 v-if="$route.query.q">Resultados da pesquisa: "{{ route.query.q }}"</h2>
        <h2 v-else-if="$route.query.category">{{ categories[route.query.category] }}</h2>

        <div class="results">
            <section class="filters">
                <strong>Ordenar por</strong>
                <select v-model="sortMethod">
                    <option
                        v-for="({description}, name) in sortMethods"
                        :key="name"
                        :value="name"
                    >{{ description }}</option>
                </select>
                <hr>

                <strong>Filtrar por</strong>
                <div>
                    <p>Preço</p>
                    <a
                        v-for="price in prices"
                        :href="searchURL(price)"
                        @click.prevent.stop="filterProducts(price)"
                        :class="{active: isCurrentPrice(price)}"
                    >{{ priceDescription(price) }}</a>
                </div>
                <div v-if="$route.query.q">
                    <p>Categoria</p>
                    <a
                        :class="{active: !$route.query.category}"
                        :href="searchURL({category: null})"
                        @click.prevent.stop="filterProducts({category: null})"
                    >Todas</a>
                    <a
                        v-for="(category, i) in categories"
                        :key="i"
                        :href="searchURL({category: i})"
                        @click.prevent.stop="filterProducts({category: i})"
                        :class="{active: ($route.query.category === i.toString())}"
                    >{{ category }}</a>
                </div>

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
    flex-wrap: wrap;
}

.filters {
    min-width: 220px;
    width: 220px;
    transition: .3s;
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
    max-width: calc(100% - 250px);
    min-width: 220px;
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
@media (max-width: 866px){
    .products .card{
        width: 220px;
    }
}
@media (max-width: 800px){
    .products{
        max-width: none;
    }
}
@media screen and (max-width: 480px) {
    .filters{
        width: 100%;
    }
    .products .card{
        width: 100%;
    }
}
</style>
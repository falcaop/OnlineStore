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
    const res = await fetch(`${import.meta.env.VITE_API_HOST}/products?${new URLSearchParams(queries)}`);
    return await res.json();
}
watch([() => route.query, sortMethod], async () => (products.value = await fetchProducts()), { immediate: true });
const categories = ["Camisas", "Calças", "Vestidos", "Casacos", "Acessórios", "Calçados"];
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

        <div class="product">
            <section class="filters">
                <h3>
                    <label for="order">Ordenar por</label>
                </h3>
                
                <select v-model="sortMethod" name="order">
                    <option
                        v-for="({description}, name) in sortMethods"
                        :key="name"
                        :value="name"
                    >{{ description }}</option>
                </select>
                <hr>

                <h3>Filtrar por</h3>
                <div>
                    <h4>Preço</h4>
                    <a
                        v-for="price in prices"
                        :href="searchURL(price)"
                        @click.prevent.stop="filterProducts(price)"
                        :class="{active: isCurrentPrice(price)}"
                    >{{ priceDescription(price) }}</a>
                </div>
                <div v-if="$route.query.q">
                    <h4>Categoria</h4>
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
            <hr class="divider">
            <section class="products">
                <p> {{ products.length }} produto(s) encontrado(s).</p>

                <ProductCard class="card" v-for="product in products" :key="product.id" v-bind="product" />
            </section>
        </div>

    </main>
</template>

<style scoped>
.results {
    display: flex;
    align-items: start;
    gap: 2.5rem;
    flex-wrap: wrap;
}
a {
    display: block;
    margin: 0.75rem 0;
}
h3{
    margin: 0;
}
label{
    margin-top: 0;
}

hr {
    color: var(--black-active);
    background-color: var(--black-active);
    margin: 1.5rem 0;
    height: 1px;
    border: none;
}

.filters {
    width: 220px;
}
.filters a:hover, .filters a.active{
    color: var(--green);
}

.products {
    width: 80%;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    max-width: calc(100% - 250px);
    min-width: 220px;
    gap: 1rem;
}

.products .card {
    width: 30%;
    min-width: 125px;
}

.products > p {
    width: 100%;
}
.divider{
    display: none;
}

@media screen and (max-width: 1100px) {
    .products .card{
        width: 40%;
    }
}

@media screen and (max-width: 767px) {
    .results, .divider{
        display: block;
    }
    .filters, .products{
        width: 100%;
        max-width: none;
    }
}

@media screen and (max-width: 480px) {
    .products{
        width: 70%;
        display: block;
    }
    .products .card{
        margin: 2rem 0;
    }
}
</style>
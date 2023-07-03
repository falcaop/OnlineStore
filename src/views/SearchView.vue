<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProductCard from '../components/ProductCard.vue';
import {toPriceString, fetchProducts} from '../assets/utils.js';

const route = useRoute();
const router = useRouter();
// valores iniciais para popular a UI enquanto os valores reais são carregados do banco
const products = ref([{ _id: '0' }, { _id: '0' }, { _id: '0' }, { _id: '0' }, { _id: '0' }, { _id: '0' }, { _id: '0' }, { _id: '0' }]);
const categories = ["Camisas", "Calças", "Vestidos", "Casacos", "Acessórios", "Calçados"];

// lista dos possiveis metodos de ordenacao dos produtos
const sortMethods = {
    nameAsc: {
        description: 'A-Z',
        info: {
            field: 'name',
            // 1 para crescente
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
            // -1 para decrescente
            order: -1,
        },
    },
    soldDesc: {
        description: 'Mais vendidos',
        info: {
            field: 'sold',
            order: -1,
        },
    },
};
const sortMethod = ref('nameAsc');

// lista dos possiveis filtros por preco
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

// recarrega os produtos quando os filtros ou o metódo de ordenação são alterados e no carregamento inicial
watch(
    [() => route.query, sortMethod],
    async () => {
        if(!route.query.q && !route.query.category) return products.value = [];
        products.value = await fetchProducts({
            queries: {
                sortField: sortMethods[sortMethod.value].info.field,
                sortOrder: sortMethods[sortMethod.value].info.order,
                ...route.query,
            },
        });
    },
    { immediate: true },
);

// retorna um objeto formatado corretamente das queries que devem ser aplicadas à página
// recebe apenas as queries que devem ser alteradas, as que não forem definidas terão a informação atual da rota mantida
const toQueryObject = ({
    category = (route.query.category ?? null),
    minPrice = route.query.minPrice,
    maxPrice = route.query.maxPrice,
}) => {
    const queryObj = {};
    if(category !== null) queryObj.category = category;
    if(minPrice) queryObj.minPrice = minPrice;
    if(maxPrice) queryObj.maxPrice = maxPrice;
    if(route.query.q) queryObj.q = route.query.q;
    return queryObj;
}

// atualiza as queries da página com os novos filtros de produtos
// recebe um objeto representando apenas as queries que devem ser alteradas
const filterProducts = queries => {
    router.push({
        path: '/search',
        query: toQueryObject(queries),
    });
}

// retorna uma string referente a uma alteração no URL da rota atual caso certas queries sejam modificadas
// recebe um objeto representando apenas as queries que devem alteradas em relacao as da rota atual
const searchURL = queries => `/search?${new URLSearchParams(toQueryObject(queries))}`;

// checa se um objeto que representa um filtro de preço é o filtro sendo aplicado pelas queries da rota atual
// recebe um objeto com `minPrice` e `maxPrice` que representa um filtro de intervalo de preços 
const isCurrentPrice = ({minPrice, maxPrice}) => {
    return (
        (minPrice === (route.query.minPrice ? parseFloat(route.query.minPrice, 10) : null))
        &&
        (maxPrice === (route.query.maxPrice ? parseFloat(route.query.maxPrice, 10) : null))
    );
}

// formatacao das string dos filtros por preco
// recebe um objeto com `minPrice` e `maxPrice` que representa um filtro de intervalo de preços 
const priceDescription = ({minPrice, maxPrice}) => {
    if(!minPrice) return `Até ${toPriceString(maxPrice)}`;
    return (
        maxPrice
        ? `Entre ${toPriceString(minPrice)} e ${toPriceString(maxPrice)}`
        : `Maior que ${toPriceString(minPrice)}`
    );
}
</script>

<template>
    <main>
        <h2 v-if="$route.query.q">Resultados da pesquisa: "{{ route.query.q }}"</h2>
        <h2 v-else-if="$route.query.category">{{ categories[route.query.category] }}</h2>

        <div class="results">
            <section class="filters">
                <h3>
                    <label for="order">Ordenar por</label>
                </h3>
                
                <select v-model="sortMethod" name="order" id="order">
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
                        :href="searchURL({
                            minPrice: null,
                            maxPrice: null,
                        })"
                        @click.prevent.stop="filterProducts({
                            minPrice: null,
                            maxPrice: null,
                        })"
                        :class="{
                            active: isCurrentPrice({
                                minPrice: null,
                                maxPrice: null,
                            }),
                        }"
                    >Todos</a>
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

                <ProductCard class="card" v-for="product in products" :key="product._id" :id="product._id" :name="product.name" :price="product.price" />
            </section>
        </div>

    </main>
</template>

<style scoped>
.results {
    display: flex;
    align-items: start;
    gap: 2.5rem;
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
    justify-content: space-between;
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
        flex-direction: column;
    }
    .products .card{
        margin: 2rem 0;
    }
}
</style>
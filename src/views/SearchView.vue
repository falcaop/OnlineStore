<script setup>
import { ref, watch} from 'vue';
import { useRoute } from 'vue-router';
import { isProxy, toRaw } from 'vue';
import ProductCard from '../components/ProductCard.vue';

let selected = "";
const route = useRoute();
const products = ref([{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}]);
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchProducts = async () => {
    await delay();
    let tmpProducts = JSON.parse(localStorage.getItem('products'));
    if(route.query.q) tmpProducts = tmpProducts.filter(e => e.name.toUpperCase().includes(route.query.q.toUpperCase()));
    if(route.query.category) tmpProducts = tmpProducts.filter(e => (e.category === parseInt(route.query.category, 10))); 
    return tmpProducts;
}
watch(() => route.query, () => fetchProducts().then(res => (products.value = res)), {immediate: true});
const categories = ['categoria1', 'categoria2', 'categoria3', 'categoria4', 'categoria5', 'categoria6', 'categoria7'];

console.log(products.value)
const sortProducts = () =>{
    switch (selected){
        case "0":
            products.value = products.value.sort((a,b) => a.name.localeCompare(b.name));
            break;
        case "1":
            products.value = products.value.sort((a,b) => a.price - b.price);
            break;
        case "2":
            products.value = products.value.sort((a,b) => b.price - a.price);
            break;
        case "3":
            products.value = products.value.sort((a,b) => a.stock - b.stock);
            break;
    }
}
</script>

<template>
    <main>
        <h2 v-if="route.query.q">Resultados da pesquisa: "{{ route.query.q }}"</h2>
        <h2 v-if="route.query.category">{{ categories[route.query.category] }}</h2>

        <div class="results">
            <section class="filters">
                <strong>Ordenar por</strong>
                <select @change="sortProducts()" v-model="selected">
                    <option selected value="0">A-Z</option>
                    <option value="1">Menor preco</option>
                    <option value="2">Maior preco</option>
                    <option value="3">Mais vendidos (nao funciona)</option>
                </select>
                <hr>

                <strong>Filtrar por</strong>
                <p>Preço</p>
                <a>Até R$50,00</a>
                <a>Entre $50,00 e R$100,00</a>
                <a>Entre $100,00 e $200,00</a>
                <a>Maior que $200,00</a>

                <p>Categoria</p>
                <a>Todas</a>
                <a v-for="(category, i) in categories"> 
                    {{ category }} {{ i }}
                </a>

            </section>

            <section class="products">
                <p> {{ products.length }} produto(s) encontrado(s).</p>

                <ProductCard class="card" v-for="product in products" :key="product.id" v-bind="product" />  
            </section>
        </div>
        
    </main>
</template>

<style scoped>
    main{
        width: 60%;
        margin: 65px auto;
        color: var(--black);
    }
    p{
        margin-top: 2em;
        font-weight: bold;
    }
    strong{
        font-size: large;
    }

    a{
        display: block;
        margin: 0.75em 0;
    }
    a:hover{
        cursor: pointer;
    }

    select{
        margin: 5% 0;
        width: 100%;
    }
    .results {
        display: flex;
        gap: 30px;
    }

    .filters{
        flex: 20%;
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
    .products > p{
        width: 100%;
        margin: 0;
    }

    hr{
        color: #3A3D41;
        background-color: #3A3D41;
        margin: 1em 0;
        height: 1px;
        border: none;
    }

    @media screen and (max-width: 767px) {
    .results{
        display: block;
    }
    .products{
        margin-top: 5em;
    }
    .products .card{
        min-width: 45%;
    }
    }

    @media screen and (max-width: 388px) {
    .products .card {
        min-width: 100%;
    }
    }
</style>
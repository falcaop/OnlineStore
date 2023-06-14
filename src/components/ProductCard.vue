<script setup>
import { useRouter } from 'vue-router';
import {toPriceString, setDefaultImage} from '../assets/utils.js';

// atributos do produto, recebidos do componente pai
const props = defineProps({
    id: Number,
    name: String,
    price: Number,
});
const image = props.id ? `${import.meta.env.VITE_API_HOST}/products/${props.id}/image` : 'https://placehold.co/500x600';

// abrir pagina do produto quando clicar no card
const router = useRouter();
const showProduct = () => router.push({
    name: 'product',
    params: { id: props.id },
    query: { name: props.name },
});
</script>

<template>
    <a :href="`/product/${id}?name=${name}`" @click.prevent.stop="showProduct">
        <img :src="image" @error="setDefaultImage"/>
        <h3 class="name"> {{ name ?? 'Lorem Ipsum' }} </h3>
        <h3>{{ toPriceString(price ?? 0) }}</h3>
    </a>
</template>

<style scoped>
a {
    background-color: white;
    color: black;
    border-radius: 8px;
    text-align: center;
    transition-duration: .3s;
    text-decoration: none;
    padding-bottom: 1%;
    overflow: hidden;
}

a:hover,
a:focus {
    background-color: #f2f2f2;
}

img {
    width: 100%;
    aspect-ratio: 5/6;
    object-fit: cover;
}

.name {
    font-weight: normal;
}
@media (max-width: 480px){
    a{
        min-width: 100% !important;
    }
}
</style>
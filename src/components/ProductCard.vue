<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps({
    id: Number,
    name: String,
    image: String,
    price: Number,
});
const showProduct = () => router.push({
    name: 'product',
    params: { id: props.id },
    query: { name: props.name },
});
</script>

<template>
    <a :href="`/product/${id}?name=${name}`" @click.prevent.stop="showProduct">
        <img :src="image ?? 'https://placehold.co/500x600'" />
        <h3 class="name"> {{ name ?? 'Lorem Ipsum' }} </h3>
        <h3> R$ {{ price ?? 0.00 }}</h3>
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
}</style>
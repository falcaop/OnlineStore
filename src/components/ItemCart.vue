<script setup>
import { useRouter } from 'vue-router';
import IconCart from './icons/IconCart.vue';

const router = useRouter();
const props = defineProps({
    id: Number,
    name: String,
    image: String,
    price: Number,
    stock: Number,
    amount: Number,
});
</script>

<template>
    <main class="item">
        <img :src="image ?? 'https://placehold.co/500x600'" />
        <div class="info">
            <div class="left">
                <h3 class="name"> {{ name ?? 'Lorem Ipsum' }} </h3>
                <p>Quantidade: {{ amount }}</p>
            </div>
            <div class="right">
                <h3> R$ {{ price ?? 0.00 }}</h3>
                <a @click="$emit('removeItem', id)">
                    <IconCart/>
                </a>
                
            </div>
        </div>
    </main>
</template>

<style scoped>
.item{
    margin: 0;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    padding-bottom: 20px;
    border-bottom: 1px solid black;
}

.info{
    width: 100%;
    display: flex;
    justify-content: space-between;
}
.right{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
}

img {
    width: 20%;
    min-width: 150px;
    aspect-ratio: 5/6;
    object-fit: cover;
    margin-right: 20px;
}

svg{
    width: 30px;
    height: 30px;
}

.name {
    font-weight: normal;


}
@media screen and (max-width: 767px) {
    .info{
        display: block;
    }
    .right{
        flex-direction: row;
        align-items: center;
    }
    .item{
        display: block;
        margin: auto;
    }
    img{
        width: 50%
    }
}

</style>
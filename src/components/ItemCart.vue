<script setup>
import { ref } from 'vue';
import IconDelete from './icons/IconDelete.vue';

const props = defineProps({
    id: Number,
    amount: Number,
});

const amount = props.amount;
const product = ref({});
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchProduct = async () => {
    await delay();
    return JSON.parse(localStorage.getItem('products')).find(e => (e.id === parseInt(props.id, 10)));
}
fetchProduct().then(res => (product.value = res));
</script>

<template>
    <main class="item">
        <img :src="product.image ?? 'https://placehold.co/500x600'" />
        <div class="info">
            <div class="left">
                <h3 class="name"> {{ product.name ?? 'Lorem Ipsum' }} </h3>
                Quantidade:
                <input class="amount" type="number" :max="product.stock" min="1" v-model="amount" @change="$emit('amountChanged', id, amount)"/>
            </div>
            <div class="right">
                <h3> R$ {{ product.price ?? 0.00 }}</h3>
                <a @click="$emit('removeItem', id)">
                    <IconDelete/>
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
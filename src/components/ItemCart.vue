<script setup>
import IconDelete from './icons/IconDelete.vue';
import utils from '../assets/utils.js';

const props = defineProps({
    id: Number,
    name: String,
    stock: Number,
    price: Number,
    amount: Number,
    purchase: Boolean,
});
const image = `${import.meta.env.VITE_API_HOSTNAME}:${import.meta.env.VITE_API_PORT}/products/${props.id}/image`;
const emit = defineEmits(['amountChanged', 'removeItem']);
const changeAmount = event => {
    let valueInt = parseInt(event.target.value, 10);
    if(isNaN(valueInt) || (valueInt < 1)) event.target.value = (valueInt = 1);
    if(valueInt <= props.stock) return emit('amountChanged', props.id, valueInt);
    event.target.value = props.stock;
    alert(`Esse produto tem apenas ${props.stock} unidades em estoque no momento`);
}
const remove = () => (confirm("Tem certeza que deseja remover o produto do carrinho?") && emit('removeItem', props.id));
</script>

<template>
    <main class="item">
        <img :src="image" @error="event => (event.target.src = 'https://placehold.co/500x600')"/>
        <div class="info">
            <div class="left">
                <h3 class="name"> {{ name ?? 'Lorem Ipsum' }} </h3>
                Quantidade:
                <div class="purchaseAmount" v-if="purchase"> {{ amount }} </div>
                <input v-else class="amount" type="number" :value="amount" :max="stock" min="1" @change="changeAmount"/>
            </div>
            <div class="right">
                <h3>{{ utils.toPriceString(price ?? 0) }}</h3>
                <a v-if="!purchase" tabindex="0" @click.prevent.stop="remove" @keyup.enter.space="remove">
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
    border-radius: 5px;
}

svg{
    width: 30px;
    height: 30px;
    transition: .3s;
    cursor: pointer;
}
svg:hover{
    fill: var(--green);
}

.name {
    font-weight: normal;
}

.purchaseAmount{
    display: inline;
}
@media (max-width: 1024px){
    .info{
        flex-direction: column;
    }
    .right{
        flex-direction: row;
        align-items: center;
    }
}
@media screen and (max-width: 768px) {
    .item{
        flex-direction: column;
        margin: auto;
    }
    img{
        width: 50%
    }
}

</style>
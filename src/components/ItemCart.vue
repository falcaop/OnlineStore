<script setup>
import IconDelete from './icons/IconDelete.vue';
import {toPriceString, setDefaultImage} from '../assets/utils.js';

// atributos do produto, recebidos do componente pai
const props = defineProps({
    id: String,
    name: String,
    stock: Number,
    price: Number,
    amount: Number,
    // caso seja um produto customizado
    preview: String,
    size: String,
    color: String,
    // identificar se e o carrinho ou uma compra ja finalizada
    purchase: Boolean,
});

const image = props.preview ?? `${import.meta.env.VITE_API_HOST}/products/${props.id}/image`;
const emit = defineEmits(['amountChanged', 'removeItem']);

// alterar a quantidade desejada do produto, emitir evento para componente pai
const changeAmount = event => {
    let valueInt = parseInt(event.target.value, 10);
    if(isNaN(valueInt) || (valueInt < 1)) event.target.value = (valueInt = 1);
    if(valueInt <= props.stock) return emit('amountChanged', props.id, valueInt);
    event.target.value = props.stock;
    alert(`Esse produto tem apenas ${props.stock} unidades em estoque no momento`);
}
// remover o produto do carrinho, emitir evento para componente pai
const remove = () => (confirm("Tem certeza que deseja remover o produto do carrinho?") && emit('removeItem', props.id));
</script>

<template>
    <main class="item">
        <img :class="{customImage: preview}" :src="image" @error="setDefaultImage"/>
        <div class="columns">
            <div class="left">
                <h3> {{ name ?? 'Lorem Ipsum' }} </h3>
                <template v-if="preview">
                    <div class="purchaseSize">Tamanho: {{ size }} </div>
                    <div class="purchaseSize purchaseColor">Cor: <div :style="{backgroundColor: color}"></div></div>
                </template>
                <label :for="`amount-${id}`">Quantidade:</label>
                <div v-if="purchase" :id="`amount-${id}`" class="purchaseAmount"> {{ amount }} </div>
                <input
                    v-else
                    class="amount"
                    name="amount"
                    type="number"
                    :value="amount"
                    :max="stock"
                    min="1"
                    @change="changeAmount"
                    :id="`amount-${id}`"
                />
            </div>
            <div class="right">
                <h3>{{ toPriceString(price ?? 0) }}</h3>
                <a v-if="!purchase" tabindex="0" @click.prevent.stop="remove" @keyup.enter.space="remove">
                    <IconDelete/>
                </a>
                
            </div>
        </div>
    </main>
</template>

<style scoped>
.item{
    display: flex;
    justify-content: flex-start;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid black;
}
.right{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
}
.amount{
    margin-left: 1rem;
    max-width: 100px;
}
.purchaseAmount{
    display: inline;
    margin-left: 0.5rem;
}

img {
    width: 20%;
    min-width: 150px;
    aspect-ratio: 5/6;
    object-fit: cover;
    margin-right: 1.5rem;
    border-radius: 5px;
}
label{
    margin-top: 0;
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
.customImage{
    object-fit: contain;
}
.purchaseSize{
    margin-bottom: 0.5rem;
}
.purchaseColor{
    display: flex;
    gap: 5px;
}
.purchaseSize div{
    border-width: 1px;
    border-style: solid;
    border-color: var(--black);
    border-radius: 50%;
    height: 1rem;
    width: 1rem;
}

@media screen and (max-width: 1200px){
    input[type="number"]{
        display: block;
        margin-left: 0;
    }
}

@media screen and (max-width: 768px) {
    .item{
        display: block;
    }
    .right{
        flex-direction: row;
    }
    img{
        width: 50%
    }
}

</style>
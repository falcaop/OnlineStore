<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import utils from '../assets/utils.js';

const route = useRoute();
const product = {price: 0, amount: 1, size: 'P', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/2048px-Instagram_icon.png'};
const cartProducts = JSON.parse(localStorage.getItem("cart")) ?? [];
let cartProduct = ref();
let amount = 1;
let selectedColor = ref('#000');
let imageLink = ref('');
let size = '';

watch(selectedColor);

const addToCart = () => {
    console.log(selectedColor.value, amount, imageLink.value, size);
}
const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFFFF", "#000000", "#FFFF00", "#00FFFF", "#FF00FF", "#808080"];
const sizes = ["PP", "P", "M", "G", "GG"];
</script>

<template>
    <main>
        <h2>Personalizar camiseta</h2>
        <div class="container">
            <div class="imagePreview">
                <img class="preview" src="https://i.pinimg.com/originals/c0/12/af/c012af0a0bf232e9d5b6f776e78cf8fc.png">
                <img class="imageOverlay" :src="imageLink"/>
            </div>
            <div class="info">
                <h1 class="price">{{ utils.toPriceString(product.price ?? 0) }}</h1>
                <form @submit.prevent.stop="addToCart">
                    <label for="colors">Cor</label>
                    <div class="colors">
                        <input type="radio" name="colors" :id="color" v-for="color in colors" :style="{backgroundColor: color}" :value="color" v-model="selectedColor">
                    </div>

                    <div class="row">
                        <div>
                            <label for="amount">Quantidade</label>
                            <input
                                required
                                :disabled="cartProduct"
                                class="amount"
                                type="number"
                                :max="product.stock"
                                min="1"
                                v-model="amount"
                                name="amount"
                            />
                        </div>
                        <div>
                            <label for="size">Tamanho</label>
                            <select name="size" class="amount" v-model="size">
                                <option v-for="size in sizes" :value="size"> {{ size }} </option>
                            </select>
                        </div>
                    </div>

                    <br>
                    <label for="estampa">Escolher estampa</label>
                    <input name="estampa" required type=text v-model="imageLink">
                    <button class="buy">Adicionar ao carrinho</button>
                </form>
            </div>
        </div>
    </main>
</template>

<style scoped>
main{
    width: 60%;
    margin: 65px auto;
    color: var(--black);
}
.imagePreview{
    width: 40%;
    position: relative;
}
.container{
    display: flex;
    gap: 5% ; 
}
.preview{
    border-radius: 10px;
    width: 100%;
    aspect-ratio: 5/6;
    object-fit: cover;
}
.imageOverlay{
    width: 30%;
    min-width: 100px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
}

.colors{
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
}
input[type="radio"] {
  appearance: none;
  margin: 0;
  width: 50px;
  height: 50px;
  border: 2px solid black;
  border-radius: 50%;
}
input[type="radio"]:focus, input[type="radio"]:checked {
    outline: max(2px, 0.15em) solid black;
}
input[type="text"]{
    width: 100%;
    box-sizing: border-box;
    height: 30px;
}

.amount{
    margin-left: 10px;
    height: 30px;
    border: none;
    box-sizing: border-box;
    max-width: 100px;
    background-color: white;
}
button{
    display: block;
    margin-top: 20px;
    border: none;
    color: white;
    padding: 15px 0;
    width: 100%;
    background-color: darkgray;
}
.buy{
    background-color: var(--green);
    cursor: pointer;
}
.buy:hover, .buy:focus{
    background-color: var(--green-active);
}
.info{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 55%;
    min-width: 273px;
}
.row{
    display: flex;
    justify-content: flex-start;
    gap: 20px;
    margin: 0;
}
.price{
    margin-top: 0;
}
label{
    margin: 10px 0;
    display: inline-block;
}
@media screen and (max-width: 1330px){
    .container{
        gap: 30px;
        flex-direction: column;
    }
    .imagePreview, .info{
        width: 100%;
        min-width: 0;
        max-width: 273px;
    }
    .row{
        display: block;
    }
    .row > div > *{
        display: block;
        margin-left: 0;
    }
}
</style>
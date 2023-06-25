<script setup>
import { ref } from 'vue';
import {toPriceString} from '../assets/utils.js';

let amount = 1;
const selectedColor = ref('#FFFFFF');
const imageLink = ref('');
let size = 0;

// lista de cores possiveis para camiseta personalizada
const colors = [
    "#FFFFFF",
    "#808080",
    "#000000",
    "#000080",
    "#4169E1",
    "#FF0000",
    "#800000",
    "#228B22",
    "#800080",
    "#FFC0CB",
    "#FFD700",
];
// lista de tamanhos possiveis para camiseta personalizada
const sizes = ["PP", "P", "M", "G", "GG"];

// adiciona o produto customizado ao localStorage
const addToCart = () => {
    const customs = JSON.parse(localStorage.getItem('customs')) ?? [];
    customs.push({
        // id usado pelo client para diferenciar os produtos customizados em um mesmo carrinho
        id: (customs.at(-1)?.id ?? 0) + 1,
        amount,
        color: selectedColor.value.slice(1),
        image: imageLink.value,
        size,
    });
    localStorage.setItem('customs', JSON.stringify(customs));
    alert('Produto adicionado ao carrinho');
}

</script>

<template>
    <main>
        <h2>Personalizar camiseta</h2>
        <div class="product">
            <div class="imagePreview">
                <img class="preview" src="https://static.vecteezy.com/system/resources/previews/012/628/183/non_2x/isolated-regular-plain-white-t-shirt-free-png.png">
                <div class="colorOverlay" :style="{backgroundColor: selectedColor}"></div>
                <img class="imageOverlay" :src="imageLink" />
            </div>
            <div class="rows">
                <p class="price">{{ toPriceString(50) }}</p>
                <form @submit.prevent.stop="addToCart">
                    <label for="colors">Cor</label>
                    <div class="colors">
                        <input
                            type="radio"
                            name="colors"
                            v-for="color in colors"
                            :key="color" :id="color"
                            :style="{backgroundColor: color}"
                            :value="color"
                            v-model="selectedColor"
                        />
                    </div>

                    <div class="columns">
                        <div class="left">
                            <label for="amount">Quantidade</label>
                            <input
                                required
                                class="amount"
                                type="number"
                                min="1"
                                v-model="amount"
                                name="amount"
                            />
                        </div>
                        <div class="right">
                            <label for="size">Tamanho</label>
                            <select name="size" class="amount" v-model="size">
                                <option v-for="(size, i) in sizes" :value="i"> {{ size }} </option>
                            </select>
                        </div>
                    </div>
                    <label for="estampa">Escolher estampa</label>
                    <input name="estampa" required type="url" v-model="imageLink">
                    <button class="button">Adicionar ao carrinho</button>
                </form>
            </div>
        </div>
    </main>
</template>

<style scoped>
.price{
    font-size: 30px;
    font-weight: bold;
    margin-top: 0;
}
.amount{
    margin-left: 1rem;
    max-width: 100px;
}
select{
    display: inline;
}
.colors{
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
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
.product{
    align-items: start;
}

.imagePreview{
    width: 40%;
    position: relative;
    background-color: black;
    border-radius: 10px;
    object-fit: cover;
}

.preview{
    border-radius: 10px;
    width: 100%;
    aspect-ratio: 5/6;
    object-fit: cover;
}
.colorOverlay{
    border-radius: 10px;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    mix-blend-mode: multiply;
    opacity: 0.8;
}
.imageOverlay{
    width: 40%;
    position: absolute;
    top: -20%;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
}

@media screen and (max-width: 1330px){
    .imagePreview{
        width: 100%;
        min-width: 0;
        max-width: 273px;
    }
}
@media screen and (max-width: 1215px) {
    .columns{
        display: block;
    }
}

@media screen and (max-width: 767px){
    .price{
        margin-top: 2rem;
    }
}
</style>
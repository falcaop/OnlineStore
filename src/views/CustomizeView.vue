<script setup>
import { ref } from 'vue';
import {toPriceString} from '../assets/utils.js';

let amount = 1;
const selectedColor = ref('#FFFFFF');
const imageLink = ref('');
const tempImage = ref('');
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
    if((customs.reduce((acc, e) => (acc + e.amount), 0) + amount) > 1000){
        return alert('Você atingiu o máximo de itens customizados por compra');
    }
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

// confirmação do envio e tipo da URL da imagem
const setImageLink = () => {
    if (!/\.(jpg|jpeg|png)$/i.test(tempImage.value))
        return alert('Formato da imagem inválido.')
    imageLink.value = tempImage.value;
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
                <form @submit.prevent.stop="addToCart" class="rows">
                    <div>
                        <label for="colors" class="title">Cor</label>
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
                    </div>

                    <div class="columns">
                        <div class="left field">
                            <label for="amount">Quantidade:</label>
                            <input
                                required
                                class="amount"
                                type="number"
                                min="1"
                                max="100"
                                v-model="amount"
                                name="amount"
                            />
                        </div>
                        <div class="right field">
                            <label for="size">Tamanho:</label>
                            <select name="size" class="amount" v-model="size">
                                <option v-for="(size, i) in sizes" :value="i"> {{ size }} </option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label for="estampa" class="title">Escolher estampa</label>
                        <div class="columns">
                            <input name="estampa" class="left" required type="url" v-model="tempImage">
                            <button type="button" class="button right" @click="setImageLink">Confirmar</button>
                        </div>
                    </div>
                    <button type="submit" class="button">Adicionar ao carrinho</button>
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
    height: auto;
    width: auto;
    flex-grow: 1;
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
.field{
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
}
form{
    gap: 1rem;
}
.title{
    margin-bottom: 0.5rem;
}
@media screen and (max-width: 1330px){
    .imagePreview{
        width: 100%;
        min-width: 0;
        max-width: 273px;
    }
}

@media screen and (max-width: 767px){
    .price{
        margin-top: 2rem;
    }
}
</style>
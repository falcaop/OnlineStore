<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { Transition } from 'vue';
import { useRoute } from 'vue-router';
import utils from '../assets/utils.js';

const route = useRoute();
const navColor = (path) => {
    if (route.path === path) return '#fff';
    else return '#ccc';
}
</script>

<template>
    <main>
        <nav>
            <ul>
                <RouterLink to="products">
                    <li :style="{backgroundColor: navColor('/admin/products')}">Produtos</li>
                </RouterLink>
                <RouterLink to="users">
                    <li :style="{backgroundColor: navColor('/admin/users')}">Usuários</li>
                </RouterLink>
            </ul>
        </nav>
        <RouterView v-slot="{ Component }" class="container" >
            <Transition name="slide-fade" mode="out-in">
                <component :is="Component"/>
            </Transition>
        </RouterView>
    </main>
</template>

<style scoped>
@import '/src/assets/slide-fade.css';
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
nav{
    color: black;
    margin-left: 1rem;
}
li{
    padding: 1rem;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    background-color: white;
    display: inline-block;
    margin-right: 0.5rem;
}
</style>
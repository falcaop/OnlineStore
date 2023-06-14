<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { Transition } from 'vue';
</script>

<template>
    <main>
        <nav>
            <ul>
                <RouterLink to="products">
                    <li>Produtos</li>
                </RouterLink>
                <RouterLink to="users">
                    <li>Usuários</li>
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
    background-color: #ccc;
    display: inline-block;
    margin-right: 0.5rem;
}
.router-link-active li{
    background-color: #fff;
}
</style>
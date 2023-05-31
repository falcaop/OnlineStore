<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router';
const router = useRouter();
let q = '';
const search = query => router.push({path: '/search', query});
const categories = ['categoria1', 'categoria2', 'categoria3', 'categoria4', 'categoria5', 'categoria6', 'categoria7'];
</script>

<template>
    <header>
        <RouterLink to="/">
            <h1>nome</h1>
        </RouterLink>
        <form class="search" @submit.prevent.stop="search({q})">
            <input type="search" v-model="q"/>
            <button>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
            </button>
        </form>
        <div class="user-buttons">
            <RouterLink to="/cart">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg>
            </RouterLink>
            <RouterLink to="/user">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg>
            </RouterLink>
        </div>
    </header>
    <nav>
        <a
            v-for="(name, id) in categories"
            :href="`/search?category=${id}`"
            :key="id"
            @click.prevent.stop="search({category: id})"
        >
            <p>{{ name }}</p>
        </a>
    </nav>
    <RouterView v-slot="{ Component }" >
        <Transition name="slide-fade" mode="out-in">
            <component :is="Component"/>
        </Transition>
    </RouterView>
    <footer>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
        </p>
    </footer>
</template>

<style scoped>
@import '/src/assets/slide-fade.css';
header{
    background-color: #27292C;
    display: flex;
    justify-content: space-around;
    padding: 10px 0;
}
.user-buttons{
    display: flex;
    align-items: center;
    gap: 10px;
}
.search{
    width: 50%;
    display: flex;
    align-items: center;
    gap: 10px;
}
.search input[type="search"]{
    width: 100%;
    height: 40px;
}
nav{
    background-color: #2EAFBB;
    display: flex;
    overflow: hidden;
}
nav a{
    flex-grow: 1;
    text-align: center;
    font-size: 13.333px;
    padding: 1px 0;
    cursor: pointer;
}
header a, nav a{
    text-decoration: none;
    color: unset;
}
nav a:hover, nav a:focus{
    background-color: #298992;
}
header button{
    background: none;
    border: none;
    color: unset;
    cursor: pointer;
    padding: 0;
}
svg{
    width: 30px;
    height: 30px;
    fill: white;
    transition: .3s;
}
svg:hover{
    fill:#2EAFBB;
}
footer{
    background-color: #27292C;
    padding: 5px 2%;
    /* margin-top: 30px; */
}
</style>

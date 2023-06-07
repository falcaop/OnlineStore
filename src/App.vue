<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import IconSearch from './components/icons/IconSearch.vue';
import IconCart from './components/icons/IconCart.vue';
import IconProfile from './components/icons/IconProfile.vue';
import { ref, watch } from 'vue';
const router = useRouter();
const route = useRoute();
const q = ref('');
watch(() => route.query.q, () => ((route.path === '/search') && (q.value = route.query.q)), {immediate: true});
const search = query => router.push({path: '/search', query});
const categories = ['categoria1', 'categoria2', 'categoria3', 'categoria4', 'categoria5', 'categoria6', 'categoria7'];
</script>

<template>
    <div>
        <header>
            <RouterLink to="/">
                <h1>nome</h1>
            </RouterLink>
            <form class="search" @submit.prevent.stop="search({q})">
                <input required type="search" v-model="q"/>
                <button>
                    <IconSearch/>
                </button>
            </form>
            <div class="user-buttons">
                <RouterLink to="/cart">
                    <IconCart/>
                </RouterLink>
                <RouterLink to="/user">
                    <IconProfile/>
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
    </div>
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
    background-color: var(--black);
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
    background-color: var(--green);
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
nav a:hover, nav a:focus{
    background-color: var(--green-active);
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
    fill: var(--green);
}
footer{
    background-color: var(--black);
    padding: 5px 2%;
    margin-top: 30px;
    z-index: 1;
}
</style>

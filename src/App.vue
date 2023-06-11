<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import IconSearch from './components/icons/IconSearch.vue';
import IconCart from './components/icons/IconCart.vue';
import IconProfile from './components/icons/IconProfile.vue';
import IconLogin from './components/icons/IconLogin.vue';
import IconLogout from './components/icons/IconLogout.vue';
import IconBars from './components/icons/IconBars.vue';

import { ref, watch } from 'vue';
const router = useRouter();
const route = useRoute();
const q = ref('');
const loggedIn = ref(localStorage.getItem('credentials'));
if(loggedIn.value) fetch(`${import.meta.env.VITE_API_HOST}/authenticate`, {
    method: 'HEAD',
    headers: {Authorization: `Basic ${loggedIn.value}`},
}).then(res => (loggedIn.value = res.ok));
watch(() => route.query.q, () => ((route.path === '/search') && (q.value = route.query.q)), {immediate: true});
const search = query => router.push({path: '/search', query});
const categories = ["Camisas", "Calças", "Vestidos", "Casacos", "Acessórios", "Calçados"];
const logout = () => {
    localStorage.removeItem('credentials');
    loggedIn.value = false;
    router.go(0);
}
const login = credentials => {
    localStorage.setItem('credentials', credentials);
    loggedIn.value = true;
    router.push(route.redirectedFrom ?? '/account');
} 

let mobileMenu = ref(false);
const openMenu = () => { mobileMenu.value = !mobileMenu.value; };

</script>

<template>
    <div>
        <header>
            <div class="mobileMenu">
                <RouterLink to="/">
                    <h1>nome</h1>
                </RouterLink>
                <IconBars @click="openMenu()" class="bars"/>
            </div>
            <form class="search" @submit.prevent.stop="search({q})"  :class="mobileMenu ? 'open-menu' : 'closed-menu'">
                <input required type="search" v-model="q"/>
                <button>
                    <IconSearch/>
                </button>
            </form>
            <div class="user-buttons" :class="mobileMenu ? 'open-menu' : 'closed-menu'">
                <template v-if="loggedIn">
                    <RouterLink to="/cart">
                        <IconCart/>
                    </RouterLink>
                    <RouterLink to="/account">
                        <IconProfile/>
                    </RouterLink>
                    <IconLogout tabindex="0" @click="logout" @keyup.space.enter="logout"/>
                </template>
                <RouterLink v-else to="/signin">
                    <IconLogin/>
                </RouterLink>
            </div>
        </header>
        <nav :class="mobileMenu ? 'open-menu' : 'closed-menu'">
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
                <component @signedIn="login" :is="Component"/>
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
    align-items: center;
}
.user-buttons{
    display: flex;
    align-items: center;
    gap: 1rem;
}
.search{
    width: 50%;
    display: flex;
    align-items: center;
    gap: 10px;
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
}
svg{
    width: 30px;
    height: 30px;
    fill: white;
    transition: .3s;
}
svg:hover{
    fill: var(--green);
    cursor: pointer;
}
footer{
    background-color: var(--black);
    padding: 5px 2%;
    margin-top: 30px;
    z-index: 1;
}
.bars{
    display: none;
}

@media screen and (max-width: 767px) {
    .open-menu {
        z-index: 100;
        left: 0%;
    }
    .closed-menu {
        left: 100%;
    }
    .mobileMenu{
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
    }
    header{
        flex-direction: column;
        gap: 2rem;
        padding: 1rem 2rem 2rem;
    }
    .search, .user-buttons{
        width: 100%;
        justify-content: center;
    }
    .bars{
        display: block;
    }
    nav {
        position: absolute;
        width: 100%;
        flex-direction: column;
        transition: .3s;
    }
}
</style>

<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import IconSearch from './components/icons/IconSearch.vue';
import IconCart from './components/icons/IconCart.vue';
import IconProfile from './components/icons/IconProfile.vue';
import IconLogin from './components/icons/IconLogin.vue';
import IconLogout from './components/icons/IconLogout.vue';
import IconBars from './components/icons/IconBars.vue';
import IconSettings from './components/icons/IconSettings.vue';

import { ref, watch } from 'vue';
const router = useRouter();
const route = useRoute();
const q = ref('');
// define o estado layout inicial da página como o de um usuário logado caso hajam credenciais salvas no localStorage
const loggedIn = ref(localStorage.getItem('credentials'));
const isAdmin = ref(false);
const categories = ["Camisas", "Calças", "Vestidos", "Casacos", "Acessórios", "Calçados"];
const mobileMenu = ref(false);

// envia uma requisição dos dados do usuário referente as credenciais para a API e atualiza o layout da página de acordo
const fetchMe = async () => {
    const res = await fetch(
        `${import.meta.env.VITE_API_HOST}/users/me`,
        {headers: {Authorization: `Basic ${loggedIn.value}`},
    });
    if(!(loggedIn.value = res.ok)) return;
    const body = await res.json();
    isAdmin.value = body.isAdmin;
}
if(loggedIn.value) fetchMe();

// caso a query de busca seja alterada e a página atual seja a de pesquisa mostra o valor no campo de busca do header
watch(() => route.query.q, () => ((route.path === '/search') && (q.value = route.query.q)), {immediate: true});

const search = query => router.push({path: '/search', query});

const logout = () => {
    localStorage.removeItem('credentials');
    loggedIn.value = false;
    isAdmin.value = false;
    // recarrega a página para rodar novamente as "navigation guards" da rota atual, desse modo caso o usuário tenha
    // deslogado enquanto acessa uma página que requer autenticação, será redirecionado para a página de login
    router.go(0);
}

const login = (credentials, admin) => {
    localStorage.setItem('credentials', credentials);
    loggedIn.value = true;
    isAdmin.value = admin;
    // devolve o usuário para a página que ele tentou acessar originalmente antes de ser redirecionado para a página de
    // login por não estar autenticado
    router.push(route.redirectedFrom ?? '/account');
} 

const openMenu = () => { mobileMenu.value = !mobileMenu.value; };

</script>

<template>
    <div>
        <header>
            <div class="mobileMenu">
                <RouterLink to="/">
                    <h1>NovaStore</h1>
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
                <RouterLink to="/cart"><IconCart/></RouterLink>
                <template v-if="loggedIn">
                    <RouterLink to="/account"><IconProfile/></RouterLink>
                    <RouterLink v-if="isAdmin" to="/admin"><IconSettings/></RouterLink>
                    <IconLogout tabindex="0" @click="logout" @keyup.space.enter="logout"/>
                </template>
                <RouterLink v-else to="/signin"><IconLogin/></RouterLink>
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
            Copyright © 2023
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
        z-index: 2;
        top: unset;
    }
    .closed-menu {
        top: -100%;
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

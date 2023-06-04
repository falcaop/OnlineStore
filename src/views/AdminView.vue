<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { Transition } from 'vue';
</script>

<template>
    <main>
        <nav>
            <div class="bars">
                <i class="fa fa-bars fa-2x"></i>
            </div>
            <div class="navbar">
                <ul>
                    <RouterLink  to="products">
                        <li class="clickable">Produtos</li>
                    </RouterLink>
                    <RouterLink to="users">
                        <li class="clickable">Usuários</li>
                    </RouterLink>
                </ul>
            </div>
        </nav>
        <RouterView v-slot="{ Component }" >
            <Transition name="slide-fade" mode="out-in">
                <component :is="Component"/>
            </Transition>
        </RouterView>
    </main>
</template>

<style scoped>
@import '/src/assets/slide-fade.css';
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
section{
    width: 70%;
    margin: 0 0 0 25%;
}

section h1{
    margin-bottom: 50px;
}
main{
    height: 100%;
    position: relative;
    overflow: auto;
    color: var(--black);
}
.navbar a{
    text-decoration: none;
    color: unset;
}
.navbar a.router-link-active li{
    background-color: var(--black-active);
}
.clickable:hover{
    cursor: pointer;
}

ul{
    list-style: none;
    margin: 0;
    padding: 0;
}

nav {
    height: 100%;
    width: 20%;
    background-color: var(--black);
    color: white;
    position: fixed;
    padding-top: 30px;
}

nav .clickable:hover {
    background-color: var(--black-active);
}

nav li, nav h2, nav i{
    padding: 20px 20%;
}

nav .bars{
    display: none;
}
nav .navbar{
    display: block;
}
@media screen and (max-width: 767px) {
    nav{
        width: 100%;
        height: 80px;
        padding-top: 0;
        position: static;
    }
    section{
        width: 90%;
        margin: 150px auto;
    }
    nav .bars{
        display: block;
    }
    nav .bars i{
        padding: 0;
        margin-left: 5%;
        margin-top: 25px;
    }
    nav .navbar{
        display: none;
    }
}
</style>
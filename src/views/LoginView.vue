<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router';
let email = '';
let passwd = '';
const router = useRouter();
const route = useRoute();
const signIn = async () => {
    const credentials = btoa(`${email}:${passwd}`);
    const res = await fetch(`${import.meta.env.VITE_API_HOSTNAME}:${import.meta.env.VITE_API_PORT}/authenticate`, {
        method: 'HEAD',
        headers: {Authorization: `Basic ${credentials}`},
    });
    if(res.status !== 204) return alert('E-mail ou senha incorretos.');
    localStorage.setItem('credentials', credentials);
    router.push(route.redirectedFrom ?? '/account');
}
</script>

<template>
    <main>
        <h1>Nome</h1>
        <div class="container">
            <form @submit.prevent.stop="signIn">
                <label for="email">E-mail</label>
                <br>
                <input v-model="email" required id="email" type="text"/>
                <br>
                <label for="password">Senha</label>
                <br>
                <input v-model="passwd" required id="password" type="password"/>
                <br>
                <RouterLink to="/resetpassword" class="clickable">Esqueceu sua senha?</RouterLink>
                <br>
                <input type="submit" value="Entrar" class="clickable">
                <br>
                <RouterLink to="/signup" class="clickable">Não tem conta? Registre-se</RouterLink>
            </form>
        </div>
    </main>
</template>

<style scoped>
main{
    color: var(--black);
}
.container{
    background-color: white;
    margin: auto;
    width: 50%;
    min-width: 250px;
    max-width: 500px;
    padding: 4%;
    border-radius: 20px;
}

form > *{
    margin: 20px auto;
}

h1{
    margin: 80px 0 40px;
    text-align: center;
}

input{
    width: 100%;
}

input[type="submit"]{
    background-color: var(--green);
    font-size: 1.2rem;
    padding: 0.7rem;
    border: none;
    color: white;
}

input[type="submit"]:hover{
    background-color: var(--green-active);
}

input[type="text"], input[type="password"], input[type="email"]{
    padding: 0.7rem;
    box-sizing: border-box;
}

.clickable:hover{
    cursor: pointer;
}

form > a{
    margin: 0;
    padding: 0;
    text-decoration: underline;
    color: var(--green);
}

@media screen and (max-width: 1023px) {
    .container{
        padding: 8%;
    }
}

@media screen and (max-width: 767px) {
    .container{
        padding: 10%;
    }
}
</style>
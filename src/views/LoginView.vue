<script setup>
import { RouterLink } from 'vue-router';
let email = '';
let passwd = '';
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
const signIn = async () => {
    await delay();
    alert('E-mail ou senha incorretos.');
}
</script>

<template>
    <main>
        <div class="container">
            <h2>Login</h2>
            <form @submit.prevent.stop="signIn">
                <label for="email">E-mail</label>
                <input v-model="email" required id="email" type="email"/>
                <label for="password">Senha</label>
                <input v-model="passwd" required id="password" type="password"/>
                <RouterLink class="link" to="/resetpassword">Esqueceu sua senha?</RouterLink>
                <input type="submit" value="Entrar">
                <RouterLink class="link" to="/signup">Não tem conta? Registre-se</RouterLink>
            </form>
        </div>
    </main>
</template>

<style scoped>
.container{
    margin: 4rem auto;
    min-width: 250px;
    max-width: 500px;
}
h2{
    margin: 0;
    text-align: center;
}
</style>
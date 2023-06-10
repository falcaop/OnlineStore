<script setup>
import { RouterLink } from 'vue-router';
let email = '';
let passwd = '';
const emit = defineEmits(['signedIn']);
const signIn = async () => {
    const credentials = btoa(`${email}:${passwd}`);
    const res = await fetch(`${import.meta.env.VITE_API_HOSTNAME}:${import.meta.env.VITE_API_PORT}/authenticate`, {
        method: 'HEAD',
        headers: {Authorization: `Basic ${credentials}`},
    });
    if(res.status !== 204) return alert('E-mail ou senha incorretos.');
    emit('signedIn', credentials);
}
</script>

<template>
    <main>
        <div class="container">
            <h2>Login</h2>
            <form @submit.prevent.stop="signIn">
                <label for="email">E-mail</label>
                <input v-model="email" required id="email" type="text"/>
                <label for="password">Senha</label>
                <input v-model="passwd" required id="password" type="password" current-password/>
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
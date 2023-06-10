<script setup>
import { RouterLink } from 'vue-router';
let name = '';
let email = '';
let address = '';
let phone = '';
let passwd = '';
let passwdConfirm = '';
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
const signUp = async () => {
    await delay();
    alert('Dados inválidos.');
}
</script>

<template>
    <main>
        <div class="container">
            <h2>Cadastro</h2>
            <form @submit.prevent.stop="signUp">
                <label for="name">Nome</label>
                <input v-model="name" required type="text" id="name">
                <label for="email">E-mail</label>
                <input v-model="email" required id="email" type="email" />
                <label for="address">Endereço</label>
                <input v-model="address" required type="text" id="address">
                <label for="phone">Telefone</label>
                <input v-model="phone" required type="tel" id="phone">
                <label for="password">Senha</label>
                <input v-model="passwd" required type="password" id="password">
                <label for="password_confirm">Confirmar Senha</label>
                <input v-model="passwdConfirm" required type="password" id="password_confirm">
                <input type="submit" value="Registrar">
                <RouterLink to="/signin" class="link">Já tem conta? Entre</RouterLink>
            </form>
        </div>
    </main>
</template>

<style scoped>
.container {
    margin: 4rem auto;
    min-width: 250px;
    max-width: 500px;
}
h2 {
    margin: 0;
    text-align: center;
}
</style>
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
        <h1>Cadastro</h1>

        <div class="container">
            <form @submit.prevent.stop="signUp">
                <label for="name">Nome</label>
                <br>
                <input v-model="name" required type="text" id="name">
                <br>

                <label for="email">E-mail</label>
                <br>
                <input v-model="email" required id="email" type="email" />
                <br>

                <label for="address">Endereço</label>
                <br>
                <input v-model="address" required type="text" id="address">
                <br>

                <label for="phone">Telefone</label>
                <br>
                <input v-model="phone" required type="tel" id="phone">
                <br>

                <label for="password">Senha</label>
                <br>
                <input v-model="passwd" required type="password" id="password">
                <br>

                <label for="password_confirm">Confirmar Senha</label>
                <br>
                <input v-model="passwdConfirm" required type="password" id="password_confirm">
                <br>

                <input type="submit" value="Registrar" class="clickable">
                <br>

                <RouterLink to="/signin" class="clickable">Já tem conta? Entre</RouterLink>
            </form>
        </div>
    </main>
</template>

<style scoped>
main {
    color: var(--black);
}

.container {
    background-color: white;
    margin: auto;
    width: 50%;
    min-width: 250px;
    max-width: 500px;
    padding: 4%;
    border-radius: 20px;
}

form>* {
    margin: 20px auto;
}

h1 {
    margin: 80px 0 40px;
    text-align: center;
}

input {
    width: 100%;
}

input[type="submit"] {
    background-color: var(--green);
    font-size: 1.2rem;
    padding: 0.7rem;
    border: none;
    color: white;
}

input[type="submit"]:hover {
    background-color: var(--green-active);
}

input[type="text"],
input[type="password"],
input[type="email"],
input[type="tel"] {
    padding: 0.7rem;
    box-sizing: border-box;
}

.clickable:hover {
    cursor: pointer;
}

form>a {
    margin: 0;
    padding: 0;
    text-decoration: underline;
    color: var(--green);
}

@media screen and (max-width: 1023px) {
    .container {
        padding: 8%;
    }
}

@media screen and (max-width: 767px) {
    .container {
        padding: 10%;
    }
}
</style>
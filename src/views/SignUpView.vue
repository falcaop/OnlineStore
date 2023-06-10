<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router';
let passwd = '';
let passwdConfirm = '';
const router = useRouter();
const route = useRoute();
const signUp = async event => {
    if(passwdConfirm !== passwd) return alert('Senhas inconsistentes');
    const formData = new FormData(event.target);
    const res = await fetch(`${import.meta.env.VITE_API_HOSTNAME}:${import.meta.env.VITE_API_PORT}/users`, {
        method: 'POST',
        body: formData,
    });
    switch(res.status){
        case 201: {
            const body = await res.json();
            localStorage.setItem('credentials', body.credentials);
            alert('Cadastro realizado');
            router.push(route.redirectedFrom ?? '/user');
        }
        break;
        case 400: alert('Dados inválidos');
        break;
        case 409: alert('Já existe um usuário cadastrado com esse emaill');
        break;
        default: alert('Um erro inesperado ocorreu, tente novamente mais tarde');
    }
}
const trim = event => (event.target.value = event.target.value.trim());
const phonePattern = /^(?:\([1-9]{2}\)|[1-9]{2})\s?(?:9[1-9]|\d)\d{3}\-?\d{4}$/;
</script>

<template>
    <main>
        <h1>Cadastro</h1>

        <div class="container">
            <form @submit.prevent.stop="signUp">
                <label for="name">Nome</label>
                <br>
                <input required type="text" id="name" name="name" @focusout="trim"/>
                <br>

                <label for="email">E-mail</label>
                <br>
                <input required id="email" type="email" name="email"/>
                <br>

                <label for="address">Endereço</label>
                <br>
                <input required type="text" id="address" name="address" @focusout="trim"/>
                <br>

                <label for="phone">Telefone</label>
                <br>
                <input required type="tel" id="phone" name="phone" :pattern="phonePattern"/>
                <br>

                <label for="password">Senha</label>
                <br>
                <input v-model="passwd" required type="password" id="password" name="password"/>
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
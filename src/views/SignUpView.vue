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
            router.push(route.redirectedFrom ?? '/account');
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
</script>

<template>
    <main>
        <div class="container">
            <h2>Cadastro</h2>
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
                <input
                    required
                    type="tel"
                    id="phone"
                    name="phone"
                    :pattern="/^(?:\([1-9]{2}\)|[1-9]{2})\s?(?:9[1-9]|\d)\d{3}-?\d{4}$/.source"
                />
                <br>

                <label for="password">Senha</label>
                <br>
                <input v-model="passwd" required type="password" id="password" name="password"/>
                <br>

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
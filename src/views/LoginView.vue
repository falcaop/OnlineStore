<script setup>
import { RouterLink } from 'vue-router';
import IconShow from '../components/icons/IconShow.vue';
import IconHide from '../components/icons/IconHide.vue';
import { ref } from 'vue';

let email = '';
let passwd = '';
const isPasswordShown = ref(false);
const emit = defineEmits(['signedIn']);

// envia uma requisição dos dados do usuário referente as credenciais entradas pelo usuário
// para a API e emite o resultado para o componente pai
const signIn = async () => {
    // converte a concatenação do email e da senha para base64
    const credentials = btoa(`${email}:${passwd}`);
    const res = await fetch(
        `${import.meta.env.VITE_API_HOST}/users/me`,
        {headers: {Authorization: `Basic ${credentials}`},
    });
    if(!res.ok) return alert('E-mail ou senha incorretos.');
    const body = await res.json();
    emit('signedIn', credentials, body.isAdmin);
}
</script>

<template>
    <main>
        <div class="container">
            <h2>Login</h2>
            <form @submit.prevent.stop="signIn" class="rows">
                <div>
                    <label for="email">E-mail</label>
                    <input v-model="email" required id="email" type="text"/>
                </div>
                <div>
                    <div class="passwordLabel">
                        <label for="password">Senha</label>
                        <IconShow
                            v-if="!isPasswordShown"
                            tabindex="0"
                            @click="isPasswordShown = true"
                            @keyup.space.enter="isPasswordShown = true"
                        />
                        <IconHide
                            v-else
                            tabindex="0"
                            @click="isPasswordShown = false"
                            @keyup.space.enter="isPasswordShown = false"
                        />
                    </div>
                    <input
                        v-model="passwd"
                        required
                        id="password"
                        :type="isPasswordShown ? 'text' : 'password'"
                        current-password
                    />
                </div>
                <div>
                    <input type="submit" value="Entrar">
                    <RouterLink class="link" to="/signup">Não tem conta? Registre-se</RouterLink>
                </div>
            </form>
        </div>
    </main>
</template>

<style scoped>
form{
    gap: 1rem;
}
label{
    margin-bottom: 0.5rem;
}
.container{
    margin: 4rem auto;
    min-width: 250px;
    max-width: 500px;
}
h2{
    margin: 0;
    text-align: center;
}
svg{
    height: 20px;
    cursor: pointer;
    transition: .3s;
}
svg:hover{
    fill: var(--green);
}
div svg:focus-visible{
    outline: auto;
}
svg:focus{
    outline: none;
}
</style>
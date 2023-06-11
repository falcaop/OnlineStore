<script setup>
import { RouterLink } from 'vue-router';
import IconShow from '../components/icons/IconShow.vue';
import IconHide from '../components/icons/IconHide.vue';
import { ref } from 'vue';

let email = '';
let passwd = '';
const isPasswordShown = ref(false);
const emit = defineEmits(['signedIn']);

const signIn = async () => {
    const credentials = btoa(`${email}:${passwd}`);
    const res = await fetch(`${import.meta.env.VITE_API_HOST}/authenticate`, {
        method: 'HEAD',
        headers: {Authorization: `Basic ${credentials}`},
    });
    if(!res.ok) return alert('E-mail ou senha incorretos.');
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
                <div>
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
form div{
    display: flex;
    gap: 10px;
    justify-content: flex-start;
    align-items: end;
    margin-bottom: 1rem;
}
form div label{
    margin-left: 0;
    margin-right: 0;
    margin-bottom: 0;
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
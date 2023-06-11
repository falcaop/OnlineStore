<script setup>
import { RouterLink } from 'vue-router';
import IconShow from '../components/icons/IconShow.vue';
import IconHide from '../components/icons/IconHide.vue';
import { ref } from 'vue';
let passwd = '';
let passwdConfirm = '';
const isPasswordShown = ref(false);
const emit = defineEmits(['signedIn']);
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
            alert('Cadastro realizado');
            emit('signedIn', body.credentials);
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
                <input required type="text" id="name" name="name" @focusout="trim"/>

                <label for="email">E-mail</label>
                <input required id="email" type="email" name="email"/>

                <label for="address">Endereço</label>
                <input required type="text" id="address" name="address" @focusout="trim"/>
                <label for="phone">Telefone</label>
                <input
                    required
                    type="tel"
                    id="phone"
                    name="phone"
                    :pattern="/(?:\([1-9]{2}\)|[1-9]{2})\s?(?:9[1-9]|\d)\d{3}-?\d{4}/.source"
                />
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
                    :type="isPasswordShown ? 'text' : 'password'"
                    id="password"
                    name="password"
                    new-password
                    minlength="8"
                    :pattern="(
                        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\-#!$@£%^&*\(\)_+\|~=`\{\}\[\]:\x22;'<>?,.\/\s]).+/.source
                    )"
                    title="A senha deve conter letras maiúsculas e minúsculas, números, e caracteres especiais"
                />
                <label for="password_confirm">Confirmar Senha</label>
                <input
                    v-model="passwdConfirm"
                    required
                    :type="isPasswordShown ? 'text' : 'password'"
                    id="password_confirm"
                    new-password
                />
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
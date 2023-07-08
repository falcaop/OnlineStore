<script setup>
import { RouterLink } from 'vue-router';
import UserFormInputs from '../components/UserFormInputs.vue';

const emit = defineEmits(['signedIn']);

// envia uma requisição para a criação de uma nova conta utilizando os dados informados pelo usuário e emite um evento
// de login para o componente pai em caso de sucesso
const signUp = async event => {
    const formData = new FormData(event.target);
    const res = await fetch(`${import.meta.env.VITE_API_HOST}/users`, {
        method: 'POST',
        body: formData,
    });
    switch(res.status){
        case 201: {
            const body = await res.json();
            alert('Cadastro realizado');
            // envia as novas credenciais convertidas para a codificação base64
            emit('signedIn', btoa(`${body.email}:${formData.get('password')}`));
        }
        break;
        case 400: alert('Dados inválidos');
        break;
        case 409: alert('Já existe um usuário cadastrado com esse email');
        break;
        default: alert('Um erro inesperado ocorreu, tente novamente mais tarde');
    }
}
</script>

<template>
    <main>
        <div class="container">
            <h2>Cadastro</h2>
            <form @submit.prevent.stop="signUp" class="rows">
                <UserFormInputs/>
                <div>
                    <input type="submit" value="Registrar">
                    <RouterLink to="/signin" class="link">Já tem conta? Entre</RouterLink>
                </div>
            </form>
        </div>
    </main>
</template>

<style scoped>
form{
    gap: 1rem;
}
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
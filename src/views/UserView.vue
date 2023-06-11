<script setup>
import { reactive } from 'vue';

const user = reactive({
    name: '',
    email: '',
    phone: '',
    address: '',
});

// solicitar informacoes do usuario logado
const fetchUser = async () => {
    const credentials = localStorage.getItem('credentials');
    user.email = atob(credentials).split(':')[0];
    const res = await fetch(
        `${import.meta.env.VITE_API_HOST}/users/${user.email}`,
        {headers: {Authorization: `Basic ${credentials}`}},
    );
    return await res.json();
}
fetchUser().then(res => Object.entries(res).forEach(([key, value]) => (user[key] = value)));

// solicitar compras do usuario
const purchases = JSON.parse(localStorage.getItem('purchases'));

// editar dados do usuario
let newUser = reactive({
    name: '',
    email: '',
    phone: '',
    address: '',
});
const showUpdateModal = () => {
    for (const key in newUser) newUser[key] = user[key];
    modal.showModal();
    document.body.style.overflowY = 'hidden';
};
const closeModal = () => modal.close();
const updateUser = async target => {
    alert('terminar');
}
</script>

<template>
    <main>
        <!-- Modal para editar os dados de um usuario -->
        <dialog @close="unhideScroll" id="modal">
            <h1>Editar usuario</h1>
            <form @submit="event => updateUser(event.target)" method="dialog">
                <label for="name">Nome</label>
                <input v-model="newUser.name" required type="text" id="name" name="name" @focusout="trim"/>

                <label for="email">E-mail</label>
                <input v-model="newUser.email" required id="email" type="text" name="email"/>

                <label for="address">Endereço</label>
                <input v-model="newUser.address" required type="text" id="address" name="address" @focusout="trim"/>
                <label for="phone">Telefone</label>
                <input
                    v-model="newUser.phone"
                    required
                    type="tel"
                    id="phone"
                    name="phone"
                    :pattern="/(?:\([1-9]{2}\)|[1-9]{2})\s?(?:9[1-9]|\d)\d{3}-?\d{4}/.source"
                />
                
                <div class="columns">
                    <input type="submit" value="Confirmar">
                    <input type="button" value="Cancelar" @click.prevent.stop="closeModal"/>
                </div>
            </form>
        </dialog>

        <!-- Conteudo da pagina -->
        <h2>Minha conta</h2>
        <div class="container">
            <h3>Informações pessoais</h3>
            <div class="columns">
                <div class="left">
                    <h4>Nome</h4>
                    <p> {{ user.name }}</p>
                    <h4>Email</h4>
                    <p> {{ user.email }}</p>
                </div>
                <hr>
                <div class="right">
                    <h4>Telefone</h4>
                    <p> {{ user.phone }}</p>
                    <h4>Endereço</h4>
                    <p> {{ user.address }}</p>
                </div> 
            </div>
            <input type="button" value="Editar dados" @keydown.enter.space="showUpdateModal" @click="showUpdateModal">
            <div class="purchases">
                <h3>Histórico de Compras</h3>
                <ul>
                    <li v-for="purchase in purchases">
                        <a :href="`/purchase/${purchase.id}`">
                            {{ purchase.id }} {{ new Date(purchase.date).toLocaleDateString() }}
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </main>
</template>

<style scoped>
.container input[type="button"]{
    width: 50%;
    margin-bottom: 2rem;
}
@media screen and (max-width: 767px){ 
    hr{
        display: none;
    }
    .container input[type="button"]{
        width: 100%;
    }
}
</style>

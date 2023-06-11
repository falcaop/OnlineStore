<script setup>
import { reactive } from 'vue';
import UserFormInputs from '../components/UserFormInputs.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const credentials = localStorage.getItem('credentials');
const user = reactive({
    name: '',
    email: atob(credentials).split(':')[0],
    phone: '',
    address: '',
    purchases: [],
});

// solicitar informacoes do usuario logado
const fetchUser = async () => {
    const res = await fetch(
        `${import.meta.env.VITE_API_HOST}/users/me`,
        {headers: {Authorization: `Basic ${credentials}`}},
    );
    return res.ok ? await res.json() : {};
}
fetchUser().then(res => Object.entries(res).forEach(([key, value]) => (user[key] = value)));

// editar dados do usuario
const showUpdateModal = () => {
    modal.showModal();
    document.body.style.overflowY = 'hidden';
};
const closeModal = () => modal.close();
const updateUser = async event => {
    const formData = new FormData(event.target);
    if(!formData.get('password')) formData.delete('password');
    const res = await fetch(`${import.meta.env.VITE_API_HOST}/users/me`, {
        method: 'PUT',
        headers: {Authorization: `Basic ${credentials}`},
        body: formData,
    });
    switch(res.status){
        case 200: {
            alert(`Dados atualizados`);
            const body = await res.json();
            localStorage.setItem(
                'credentials',
                btoa(`${body.email}:${formData.get('password') ?? atob(credentials).split(':')[1]}`),
            );
            for(const key in user) user[key] = body[key];
        }
        break;
        case 400: alert('Dados inválidos');
        break;
        case 401: {
            alert('Usuário não autenticado');
            router.push({path: '/signin'});
        }
        break;
        case 409: alert('Já existe um usuário cadastrado com esse email');
        break;
        default: alert('Um erro inesperado ocorreu, tente novamente mais tarde');
    }
};
const unhideScroll = () => document.body.style.overflowY = 'unset';
</script>

<template>
    <main>
        <!-- Modal para editar os dados de um usuario -->
        <dialog @close="unhideScroll" id="modal">
            <h1>Editar dados</h1>
            <form @submit="updateUser" method="dialog">
                <UserFormInputs :address="user.address" :email="user.email" :name="user.name" :phone="user.phone"/>
                
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
                    <p> {{ `(${user.phone.slice(0, 2)}) ${user.phone.slice(2, -4)}-${user.phone.slice(-4)}` }}</p>
                    <h4>Endereço</h4>
                    <p> {{ user.address }}</p>
                </div> 
            </div>
            <input type="button" value="Editar dados" @keydown.enter.space="showUpdateModal" @click="showUpdateModal">
            <div class="purchases">
                <h3>Histórico de Compras</h3>
                <ul>
                    <li v-for="purchase in user.purchases">
                        <a :href="`/purchase/${purchase.id}`">
                            {{ new Date(purchase.date).toLocaleDateString() }} - Compra de {{ purchase.products.length }} produto(s)
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
ul{
    list-style:unset;
    list-style-position: inside;
}
li{
    margin-bottom: 1em;
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

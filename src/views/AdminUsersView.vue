<script setup>
import AdminSearch from '../components/AdminSearch.vue';
import AdminListItem from '../components/AdminListItem.vue';
import UserFormInputs from '../components/UserFormInputs.vue';
import { useRoute, useRouter } from 'vue-router';
import { reactive, ref, watch } from 'vue';
import { closeModal, unhideScroll } from '../assets/utils';

const route = useRoute();
const router = useRouter();

// valores iniciais para popular a UI enquanto os valores reais são carregados do banco
const users = ref([{email: 'a'}, {email: 'b'}, {email: 'c'}, {email: 'd'}, {email: 'e'}, {email: 'f'}, {email: 'g'}]);
const url = `${import.meta.env.VITE_API_HOST}/users`;
const Authorization = `Basic ${localStorage.getItem('credentials')}`;
// retorna usuários da API opcionalmente usando pesquisa pelo nome e pelo nível de permissão (administrador ou não)
const fetchUsers = async () => {
    const queries = {};
    if(route.query.q) queries.q = route.query.q;
    if(route.query.admin) queries.admin = route.query.admin;
    const res = await fetch(`${url}?${new URLSearchParams(queries)}`, {headers: {Authorization}});
    return res.ok ? await res.json() : [];
}
// recarrega os usuários quando as query strings são alteradas e no carregamento inicial da página
watch(() => route.query, async () => (users.value = await fetchUsers()), {immediate: true});
let currentUser = null;
// valores dos inputs do form de adicionar/atualizar usuário
const newUser = reactive({
    email: null,
    name: null,
    address: null,
    phone: null,
    password: null,
    isAdmin: null,
});
// carrega os dados do usuário atual nos campos e mostra o modal com o form
const showUpdateModal = id => {
    currentUser = users.value.find(user => (user.id === id));
    for(const key in newUser) newUser[key] = currentUser[key];
    modal.showModal();
    // esconde a barra de scroll principal
    document.body.style.overflowY = 'hidden';
};
// reseta os valores dos campos e mostra o modal com o form
const showAddModal = () => {
    currentUser = null;
    for(const key in newUser) newUser[key] = null;
    modal.showModal();
    document.body.style.overflowY = 'hidden';
}
// envia uma requisição de adicionar um novo usuário para a API e atualiza os usuários em cache em caso de sucesso
const addItem = async target => {
    const formData = new FormData(target);
    const res = await fetch(url, {
        method: 'POST',
        headers: {Authorization},
        body: formData,
    });
    switch(res.status){
        case 201: {
            alert(`${formData.get('name')} adicionado`);
            const user = await res.json();
            users.value.push(user);
        }
        break;
        case 400: alert('Dados inválidos');
        break;
        case 409: alert('Já existe um usuário cadastrado com esse email');
        break;
        default: alert('Um erro inesperado ocorreu, tente novamente mais tarde');
    }
};
// envia uma requisição para atualizar um usuário para a API e atualiza os usuários em cache em caso de sucesso
const updateItem = async target => {
    const formData = new FormData(target);
    // não envia um campo de senha caso nenhuma nova senha tenho sido definida
    if(!formData.get('password')) formData.delete('password');
    const res = await fetch(`${url}/${currentUser.id}`, {
        method: 'PUT',
        headers: {Authorization},
        body: formData,
    });
    switch(res.status){
        case 200: {
            alert(`${currentUser.name} atualizado`);
            const user = await res.json();
            for(const key in user) currentUser[key] = user[key];
        }
        break;
        case 400: alert('Dados inválidos');
        break;
        case 401: {
            alert('Usuário não autenticado');
            router.push({path: '/signin'});
        }
        break;
        case 403: {
            alert('Permissões insuficientes');
            router.push({path: '/'});
        }
        break;
        case 404: {
            alert('Usuário não encontrado');
            // remove o usuário do cache da página
            users.value = users.value.filter(({id}) => (id !== currentUser.id));
        }
        break;
        case 409: alert('Já existe um usuário cadastrado com esse email');
        break;
        default: alert('Um erro inesperado ocorreu, tente novamente mais tarde');
    }
};
// envia uma requisição para remover um usuário para a API e atualiza os usuários em cache em caso de sucesso
const deleteItem = async id => {
    currentUser = users.value.find(user => (user.id === id));
    if(!confirm(`Tem certeza que deseja deletar ${currentUser.name}?`)) return;
    const res = await fetch(`${url}/${id}`, {
        method: 'DELETE',
        headers: {Authorization},
    });
    switch(res.status){
        case 204: {
            alert(`${currentUser.name} deletado`);
            users.value = users.value.filter(user => (user.id !== id));
        }
        break;
        case 401: {
            alert('Usuário não autenticado');
            router.push({path: '/signin'});
        }
        break;
        case 403: {
            alert('Permissões insuficientes');
            router.push({path: '/'});
        }
        break;
        case 404: {
            alert('Usuário não encontrado');
            users.value = users.value.filter(user => (user.id !== id));
        }
        break;
        default: alert('Um erro inesperado ocorreu, tente novamente mais tarde');
    }
};
</script>

<template>
    <section>
        <dialog @close="unhideScroll" id="modal">
            <h1 v-if="currentUser">{{ `Editar ${currentUser.name}` }}</h1>
            <h1 v-else>Adicionar usuario</h1>
            <form @submit="event => currentUser ? updateItem(event.target) : addItem(event.target)" method="dialog">
                <UserFormInputs
                    :email="newUser.email"
                    :name="newUser.name"
                    :address="newUser.address"
                    :phone="newUser.phone"
                />
                <input type="checkbox" id="admin" name="admin" :checked="newUser.isAdmin"/>
                <label for="admin">Administrator</label>
                <div class="columns">
                    <input type="submit" value="Confirmar">
                    <input type="button" value="Cancelar" @click.prevent.stop="closeModal"/>
                </div>
            </form>
        </dialog>
        
        <h1>Usuários</h1>
        <AdminSearch queryName="admin" :options="['Clientes', 'Administradores']"/>

        <div class="alignRight">
            <i
                tabindex="0"
                @keydown.enter.space="showAddModal"
                @click="showAddModal"
                class="fa fa-plus fa-2x clickable"
            ></i>
        </div>
        <ul>
            <hr>
            <template v-for="user in users" :key="user.id">
                <AdminListItem
                    @updateItem="showUpdateModal"
                    @deleteItem="deleteItem"
                    v-bind="user"
                />
                <hr>
            </template>
        </ul>
    </section>
</template>

<style scoped>
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
</style>
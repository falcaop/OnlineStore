<script setup>
const user = {name: 'joao', email: 'joao@123.com', phone: '(00)90000-0000', address:'Avenida Trabalhador São Carlense, 400'};
const purchases = JSON.parse(localStorage.getItem('purchases'));
</script>

<template>
    <main>
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
            <input type="button" value="Editar dados">
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
input[type="button"]{
    width: 50%;
    margin-bottom: 2rem;
}
@media screen and (max-width: 767px){ 
    hr{
        display: none;
    }
    input[type="button"]{
        width: 100%;
    }
}
</style>

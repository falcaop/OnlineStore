<script setup>
const user = {name: 'joao', email: 'joao@123.com', phone: '(00)90000-0000', address:'Avenida Trabalhador São Carlense, 400'};
const purchases = JSON.parse(localStorage.getItem('purchases'));
</script>

<template>
    <main>
        <h2>Minha conta</h2>
        <div class="container">
            <div class="info">
                <div class="left">
                    <h3>Nome</h3>
                    <p> {{ user.name }}</p>
                    <h3>Email</h3>
                    <p> {{ user.email }}</p>
                </div>
                <hr>
                <div class="right">
                    <h3>Telefone</h3>
                    <p> {{ user.phone }}</p>
                    <h3>Endereço</h3>
                    <p> {{ user.address }}</p>
                </div> 
            </div>
            <input type="button" value="Editar dados" class="clickable">
            <div class="purchases">
                <h3>Historico de compras</h3>
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
main{
    width: 50%;
    margin: 65px auto;
    color: var(--black);
}
    
.container{
    background-color: white;
    margin: auto;
    width: 100%;
    padding: 6%;
    box-sizing: border-box;
    border-radius: 20px;
}

input[type="button"]{
    margin: 1rem 0;
    width: 50%;
    background-color: var(--green);
    font-size: 1.2rem;
    padding: 0.7rem;
    border: none;
    color: white;
    min-width: 200px;
}

input[type="button"]:hover{
    background-color: var(--green-active);
}

.clickable:hover{
    cursor: pointer;
}

.info{
    display: flex;
    justify-content: flex-start;
    gap: 20px;
}

.left, .right{
    width: 100%;
}


@media screen and (max-width: 1023px) {
    main{
        width: 60%;
    }
    .container{
        padding: 8%;
    }
    .info{
        display: block;
    }
    hr{
        display: none;
    }
}

@media screen and (max-width: 767px) {
    main{
        width: 70%;
    }
    .container{
        padding: 10%;
    }
}
</style>

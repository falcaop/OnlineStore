<script setup>
import { useRouter } from 'vue-router';

let number = '';
let date = null;
let code = '';
const router = useRouter();
// finalizar compra, esvaziar carrinho e adicionar compra a lista de compras do usuario
const submitPayment = async event => {
    const products = JSON.parse(localStorage.getItem('cart')) ?? [];
    const customs = JSON.parse(localStorage.getItem('customs')) ?? [];
    if (!products.length && !customs.length) return alert('Nenhum produto no carrinho');
    const formData = new FormData(event.target);
    formData.append('cart', JSON.stringify(products));
    formData.append('customs', JSON.stringify(customs));
    const res = await fetch(`${import.meta.env.VITE_API_HOST}/purchases`, {
        method: 'POST',
        headers: {Authorization: `Basic ${localStorage.getItem('credentials')}`},
        body: formData,
    });
    switch(res.status){
        case 201: {
            localStorage.removeItem('cart');
            localStorage.removeItem('customs');
            alert('Compra finalizada');
            router.push('/');
        }
        break;
        // fazer o case 400 data errada
        case 401: {
            alert('Usuário não autenticado');
            router.push('/signin');
        }
        break;
        case 406: {
            // fazer ele ver qual produto nao tem avisar e tirar do carrinho
            alert('algum produto ta sem estoque');
        }
        break;
        default: alert('Um erro inesperado ocorreu, tente novamente mais tarde');
    }
}
</script>

<template>
    <main>
        <h2>Pagamento</h2>
        <div class="container">
            <form @submit.prevent.stop="submitPayment">
                <label for="number">Numero do cartao</label>
                <input v-model="number" required id="number" type="text" :pattern="/\d+/.source" name="cardNumber"/>
                <div class="columns">
                    <div class="left">
                        <label for="date">Data de validade</label>
                        <input v-model="date" required id="date" type="month" name="cardDate"/>
                    </div>
                    <div class="right">
                        <label for="code">Codigo de seguranca</label>
                        <input v-model="code" required id="code" type="text" :pattern="/\d{3}/.source" name="cardCode"/>
                    </div> 
                </div>
                <div class="alignRight">
                    <input type="submit" value="Finalizar compra">
                </div>  
            </form>
        </div>
    </main>
</template>

<style scoped>
input[type="submit"]{
    width: 50%;
}
@media screen and (max-width: 767px) {
    hr{
        display: none;
    }
    input[type="submit"]{
        width: 100%;
    }
}
</style>
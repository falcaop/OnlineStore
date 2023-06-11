<script setup>
let number = '';
let date = null;
let code = '';
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

// finalizar compra, esvaziar carrinho e adicionar compra a lista de compras do usuario
const submitPayment = async () => {
    await delay();
    const products = JSON.parse(localStorage.getItem('cart'));
    if (!products) return alert('Nenhum produto no carrinho');
    const purchases = JSON.parse(localStorage.getItem('purchases')) ?? [];
    let id = 0;
    if (purchases.length){
        id = purchases[purchases.length-1].id + 1;
    }
    purchases.push({id: id, date: new Date(), products: products});
    localStorage.setItem('purchases', JSON.stringify(purchases));
    localStorage.removeItem('cart');
    alert('Compra finalizada');
}
</script>

<template>
    <main>
        <h2>Pagamento</h2>
        <div class="container">
            <form @submit.prevent.stop="submitPayment()">
                <label for="number">Numero do cartao</label>
                <input v-model="number" required id="number" type="text"/>
                <div class="columns">
                    <div class="left">
                        <label for="date">Data de validade</label>
                        <input v-model="date" required id="date" type="month"/>
                    </div>
                    <div class="right">
                        <label for="code">Codigo de seguranca</label>
                        <input v-model="code" required id="code" type="text"/>
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
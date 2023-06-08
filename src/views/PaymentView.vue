<script setup>
let number = '';
let date = null;
let code = '';
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
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
                <div class="info">
                    <div class="dateDiv">
                        <label for="date">Data de validade</label>
                        <input v-model="date" required id="date" type="month"/>
                    </div>
                    <div class="codeDiv">
                        <label for="code">Codigo de seguranca</label>
                        <input v-model="code" required id="code" type="text"/>
                    </div> 
                </div>
                <input type="submit" value="Finalizar compra" class="clickable">
            </form>
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

input[type="submit"]{
    width: 50%;
    background-color: var(--green);
    font-size: 1.2rem;
    padding: 0.7rem;
    border: none;
    color: white;
    min-width: 200px;
}

input[type="submit"]:hover{
    background-color: var(--green-active);
}

input[type="text"], input[type="month"]{
    width: 100%;
    padding: 0.7rem;
    height: 2.5rem;
    box-sizing: border-box;
    margin: 10px 0;
}

.clickable:hover{
    cursor: pointer;
}

.info{
    display: flex;
    justify-content: flex-start;
    gap: 20px;
}

.codeDiv, .dateDiv{
    margin: 30px 0;
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
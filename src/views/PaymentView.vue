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
    const cardDate = Date.parse(formData.get('cardDate'));
    if(isNaN(cardDate)) return alert('Data de validade do cartão inválida');
    if(cardDate < Date.now()) return alert('Data de validade do cartão expirada');
    formData.append('cart', JSON.stringify(products));
    formData.append('customs', JSON.stringify(customs));
    const res = await fetch(`${import.meta.env.VITE_API_HOST}/users/me/purchases`, {
        method: 'POST',
        headers: {Authorization: `Basic ${localStorage.getItem('credentials')}`},
        body: formData,
    });
    switch(res.status){
        case 201: {
            localStorage.removeItem('cart');
            localStorage.removeItem('customs');
            alert('Compra finalizada');
            const purchaseDocument = await res.json();
            router.push({
                name: 'purchase',
                params: {id: purchaseDocument._id},
            });
        }
        break;
        case 401: {
            alert('Usuário não autenticado');
            router.push('/signin');
        }
        break;
        case 406: {
            const body = await res.json();
            if(body.name){
                if(body.stock === 0){
                    products.splice(products.findIndex(({id}) => (id === body.id)), 1);
                    localStorage.setItem('cart', JSON.stringify(products));
                    alert(
                        `O produto ${body.name} não está mais em estoque, então removemos ele do seu carrinho,` +
                        ' confira o seu pedido e tente novamente'
                    );
                    return router.push('/cart');
                }
                products.find(({id}) => (id === body.id)).amount = body.stock;
                localStorage.setItem('cart', JSON.stringify(products));
                alert(
                    `O produto ${body.name} possui apenas ${body.stock} itens em estoque, então removemos a` +
                    ' quantia excedente do seu carrinho, confira o seu pedido e tente novamente'
                );
                return router.push('/cart');
            }
            products.splice(products.findIndex(({id}) => (id === body.id)), 1);
            localStorage.setItem('cart', JSON.stringify(products));
            alert(
                'Um ou mais itens do seu pedido não foram encontrado no sistema, confira o seu carrinho e' +
                ' tente novamente'
            );
            router.push('/cart');
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
            <form @submit.prevent.stop="submitPayment" class="rows">
                <div>
                    <label for="number">Numero do cartao</label>
                    <input v-model="number" required id="number" type="text" :pattern="/\d+/.source" name="cardNumber"/>
                </div>
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
                <input class="alignRight" type="submit" value="Finalizar compra">
            </form>
        </div>
    </main>
</template>

<style scoped>
label{
    margin-bottom: 0.5rem;
}
form{
    gap: 1rem;
}
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
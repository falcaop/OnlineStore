// transforma um número em uma string com formato de preço em reais
const toPriceString = price => price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

// retorna produtos da API opcionalmente usando query strings
// recebe respectivamente:
// - as `queries` de filtro como um objeto nome-valor
// - opcionalmente um array de `ids` de produtos específicos
const fetchProducts = async ({queries, ids = []}) => {
    const res = await fetch(
        `${import.meta.env.VITE_API_HOST}/products?` +
        ids.map(id => `id=${id}`).concat(new URLSearchParams(queries)).join('&')
    );
    return (res.status === 200) ? await res.json() : [];
}

const closeModal = () => modal.close();

const unhideScroll = () => document.body.style.overflowY = 'unset';

// retorna o valor total de um conjunto de produtos
// recebe respectivamente:
// - um array de objetos com `id` e `amount` que representam os produtos normais presentes no
// carrinho
// - um array de objetos desses produtos retornados pela API
// - um array de objetos com `id`, `amount`, `color` `size` e `image` que representam os produtos customizados presentes
// no carrinho
const calcTotalPriceString = (cartProducts, products, customProducts) => {
    return toPriceString(
        cartProducts.reduce(
            (acc, {id, amount}) => (acc + ((products.find(product => (product._id === id))?.price ?? 0) * amount)),
            0,
        )
        +
        customProducts.reduce((acc, {amount}) => (acc + (50 * amount)), 0),
    );
}

const setDefaultImage = event => (event.target.src = 'https://placehold.co/500x600');

export {toPriceString, fetchProducts, closeModal, unhideScroll, calcTotalPriceString, setDefaultImage};
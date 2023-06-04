const toPriceString = price => price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

export default {toPriceString};
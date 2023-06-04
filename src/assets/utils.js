const toPriceString = price => price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const priceDescription = ({minPrice, maxPrice}) => {
    if(!minPrice) return `Até ${toPriceString(maxPrice)}`;
    return (
        maxPrice
        ? `Entre ${toPriceString(minPrice)} e ${toPriceString(maxPrice)}`
        : `Maior que ${toPriceString(minPrice)}`
    );
}

export default {priceDescription, toPriceString};
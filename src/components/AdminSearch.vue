<script setup>
let q = '';
let category = '';
const categories = ['categoria1', 'categoria2', 'categoria3', 'categoria4', 'categoria5', 'categoria6', 'categoria7'];
</script>

<template>
    <main>
        <form class="searchbar" @submit.prevent.stop="$router.push({query: {q, category}})">
            <input v-model="q" type="search"/>
            <select v-model.number="category">
                <option value="">Todas</option>
                <option v-for="(categoryName, i) in categories" :key="i" :value="i">{{ categoryName }}</option>
            </select>
            <button>
                <i class="fa fa-search fa-2x clickable"></i>
            </button>
        </form>
    </main>
</template>

<style scoped>
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
main{
    width: 100%;
}
.searchbar input{
    width: 90%;
    padding: 0.7rem;
    box-sizing: border-box;
}
.searchbar{
    margin-bottom: 50px;
    display: flex;
    justify-content: space-between;
    gap: 20px;
}
@media screen and (max-width: 767px) {
    .searchbar input{
        width: 80%;
    }
}
button{
    background: none;
    border: none;
    color: unset;
    cursor: pointer;
    padding: 0;
}
</style>
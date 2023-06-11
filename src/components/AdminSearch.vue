<script setup>
defineProps({
    queryName: String,
    options: Array,
})
let q = '';
let selected = '';
</script>

<template>
    <main>
        <form class="searchbar" @submit.prevent.stop="$router.push({query: {q, [queryName]: selected}})">
            <input v-model="q" type="search"/>
            <select v-model.number="selected">
                <option value="">Todas</option>
                <option v-for="(optionName, i) in options" :key="i" :value="i">{{ optionName }}</option>
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
    padding: 0.7rem;
    box-sizing: border-box;
}
.searchbar select{
    width: auto;
}
.searchbar{
    margin-bottom: 50px;
    display: flex;
    justify-content: space-between;
    gap: 20px;
}
@media screen and (max-width: 768px) {
    .searchbar{
        flex-direction: column;
        gap: 10px;
        align-items: start;
    }
    .searchbar select{
        width: 100%;
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
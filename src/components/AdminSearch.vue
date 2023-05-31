<script setup>
let q = '';
</script>

<template>
    <main>
        <form class="searchbar" @submit.prevent.stop="$router.push({query: {q}})">
            <input v-model="q" type="search"/>
            <button>
                <i class="fa fa-search fa-2x clickable"></i>
            </button>
        </form>
    </main>
</template>

<style scoped>
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
i{
    margin-left: 20px;
    transition: .3s;
}
i:hover{
    color: #2EAFBB;
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
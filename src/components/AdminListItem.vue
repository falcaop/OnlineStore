<script setup>
defineProps({
    name: String,
    id: String,
})
</script>

<template>
    <li>
        <div>
            <span>{{ name }}</span>
            <div>
                <i
                    tabindex="0"
                    @click="$emit('updateItem', id)"
                    @keydown.enter.space="$emit('updateItem', id)"
                    class="fa fa-pencil clickable"
                ></i>
                <i
                    tabindex="0"
                    @keydown.enter.space="$emit('deleteItem', id)"
                    @click="$emit('deleteItem', id)"
                    class="fa fa-trash clickable"
                ></i>
            </div>
        </div>
    </li>
</template>

<style scoped>
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
li > div{
    margin: 15px;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
}
li > div > div{
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}
</style>
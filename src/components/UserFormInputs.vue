<script setup>
import IconShow from '../components/icons/IconShow.vue';
import IconHide from '../components/icons/IconHide.vue';
import { reactive, ref, watchEffect } from 'vue';

// valores predefinidos dos campos caso seja um form de atualização de dados
const props = defineProps({
    email: String,
    name: String,
    address: String,
    phone: String,
});
// usado nos valores reais dos inputs para que sejam reativos a mudanças
const cachedProps = reactive({
    email: props.email,
    name: props.name,
    address: props.address,
    phone: props.phone,
    password: '',
    passwordC: '',
});
// redefine os valores dos inputs caso sejam recebidos novos atributos padrões do componente pai
watchEffect(() => {
    for(const key of ['email', 'name', 'address', 'phone']) cachedProps[key] = props[key];
    cachedProps.passwordC = cachedProps.password = '';
});
const isPasswordShown = ref(false);
const passwordTitle = (
    'A senha deve conter letras maiúsculas e minúsculas, números, e caracteres especiais, e não deve conter o' +
    ' caractere ":".'
);
// remove espaços no inicio e no final do valor do input
const trim = event => (event.target.value = event.target.value.trim());
</script>

<template>
    <label for="name">Nome</label>
    <input v-model="cachedProps.name" required type="text" id="name" name="name" @focusout="trim"/>

    <label for="email">E-mail</label>
    <input v-model="cachedProps.email" required id="email" type="email" name="email"/>

    <label for="address">Endereço</label>
    <input v-model="cachedProps.address" required type="text" id="address" name="address" @focusout="trim"/>
    <label for="phone">Telefone</label>
    <input
        v-model="cachedProps.phone"
        required
        type="tel"
        id="phone"
        name="phone"
        :pattern="/(?:\([1-9]{2}\)|[1-9]{2})\s?(?:9[1-9]|\d)\d{3}-?\d{4}/.source"
    />
    <div>
        <label for="password">Senha</label>
        <IconShow
            v-if="!isPasswordShown"
            tabindex="0"
            @click="isPasswordShown = true"
            @keyup.space.enter="isPasswordShown = true"
        />
        <IconHide
            v-else
            tabindex="0"
            @click="isPasswordShown = false"
            @keyup.space.enter="isPasswordShown = false"
        />
    </div>
    <input
        v-model="cachedProps.password"
        :required="!email"
        :type="isPasswordShown ? 'text' : 'password'"
        id="password"
        name="password"
        new-password
        minlength="8"
        :pattern="/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\-#!$@£%^&*\(\)_+\|~=`\{\}\[\]\x22;'<>?,.\/\s])(?!.*:).+/.source"
        :title="passwordTitle"
    />
    <label for="password_confirm">Confirmar Senha</label>
    <input
        v-model="cachedProps.passwordC"
        :required="!email"
        :type="isPasswordShown ? 'text' : 'password'"
        id="password_confirm"
        new-password
        title="Repita a senha definida no campo acima"
        :pattern="cachedProps.password.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')"
    />
</template>

<style scoped>
form div{
    display: flex;
    gap: 10px;
    justify-content: flex-start;
    align-items: end;
    margin-bottom: 1rem;
}
form div label{
    margin-left: 0;
    margin-right: 0;
    margin-bottom: 0;
}
svg{
    height: 20px;
    cursor: pointer;
    transition: .3s;
}
svg:hover{
    fill: var(--green);
}
div svg:focus-visible{
    outline: auto;
}
svg:focus{
    outline: none;
}
</style>
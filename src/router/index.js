import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

// retorna uma funcao que redireciona o usuário caso ele não cumpra com o criterio de permissão para acessar uma página
// recebe um boolean indicando se a função deve requerir que o usuário seja administrador ou não
const isAuthenticated = (admin = false) => async () => {
    const credentials = localStorage.getItem('credentials');
    if(!credentials) return '/signin';
    const res = await fetch(`${import.meta.env.VITE_API_HOST}/authenticate?admin=${Number(admin)}`, {
        method: 'HEAD',
        headers: {Authorization: `Basic ${credentials}`},
    });
    if(!res.ok) return (admin ? '/404' : '/signin');
}

// redireciona o usuário caso ele já esteja logado no sistema
const isUnauthenticated = async () => {
    const credentials = localStorage.getItem('credentials');
    if(!credentials) return true;
    const res = await fetch(`${import.meta.env.VITE_API_HOST}/authenticate`, {
        method: 'HEAD',
        headers: {Authorization: `Basic ${credentials}`},
    });
    if(res.ok) return '/account';
}
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/product/:id',
            name: 'product',
            // quando o componente é importado dinamicamente ele é "lazy-loaded" apenas quando o usuário tenta acessar
            // a página pela primeira vez, diminuindo a carga inicial possivelmente desnecessária recebida pelo client
            component: () => import('../views/ProductView.vue'),
            // checa se o produto existe antes de começar a carregar a página
            beforeEnter: async to => {
                const res = await fetch(`${import.meta.env.VITE_API_HOST}/products/${to.params.id}`, {method: 'HEAD'});
                if(!res.ok) return '/404';
            },
        },
        {
            path: '/search',
            name: 'search',
            component: () => import('../views/SearchView.vue'),
        },
        {
            path: '/customize',
            component: () => import('../views/CustomizeView.vue'),
        },
        {
            path: '/404',
            component: () => import('../views/404View.vue'),
        },
        {
            path: '/signin',
            component: () => import('../views/LoginView.vue'),
            beforeEnter: isUnauthenticated,
        },
        {
            path: '/cart',
            component: () => import('../views/CartView.vue'),
        },
        {
            path: '/payment',
            component: () => import('../views/PaymentView.vue'),
            beforeEnter: isAuthenticated(),
        },
        {
            path: '/account',
            component: () => import('../views/UserView.vue'),
            beforeEnter: isAuthenticated(),
        },
        {
            path: '/purchase/:id',
            name: 'purchase',
            component: () => import('../views/PurchaseView.vue'),
            beforeEnter: isAuthenticated(),
        },
        {
            path: '/signup',
            component: () => import('../views/SignUpView.vue'),
            // transfere a informação da página que o usuário tentou acessar originalmente antes de ser redirecionado
            // para o login/cadastro da página de login para a página de cadastro para o redirecionar de volta ao
            // finalizar o cadastro
            beforeEnter: [isUnauthenticated, (to, from) => {to.redirectedFrom = from.redirectedFrom}],
        },
        {
            path: '/admin',
            component: () => import('../views/AdminView.vue'),
            children: [
                {
                    path: '',
                    redirect: '/admin/products',
                },
                {
                    path: 'products',
                    component: () => import('../views/AdminProductsView.vue'),
                },
                {
                    path: 'users',
                    component: () => import('../views/AdminUsersView.vue'),
                },
            ],
            beforeEnter: isAuthenticated(true),
        },
        {
            path: '/404',
            component: () => import('../views/404View.vue'),
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/404',
        },
    ],
    // "scrollar" para o topo suavemente ao mudar de página
    scrollBehavior(){
        return {
            top: 0,
            behavior: 'smooth',
        };
    },
});

export default router;

import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const apiHost = `${import.meta.env.VITE_API_HOSTNAME}:${import.meta.env.VITE_API_PORT}`;
const isAuthenticated = (admin = false) => async () => {
    const credentials = localStorage.getItem('credentials');
    if(!credentials) return '/signin';
    const res = await fetch(`${apiHost}/authenticate?admin=${Number(admin)}`, {
        method: 'HEAD',
        headers: {Authorization: `Basic ${credentials}`},
    });
    if(res.status !== 204) return (admin ? '/404' : '/signin');
}
const isUnauthenticated = async () => {
    const credentials = localStorage.getItem('credentials');
    if(!credentials) return true;
    const res = await fetch(`${apiHost}/authenticate`, {
        method: 'HEAD',
        headers: {Authorization: `Basic ${credentials}`},
    });
    if(res.status === 204) return '/account';
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
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/ProductView.vue'),
            beforeEnter: async to => {
                const res = await fetch(`${apiHost}/products/${to.params.id}`, {method: 'HEAD'});
                if(res.status !== 204) return '/404';
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
            path: '/signin',
            component: () => import('../views/LoginView.vue'),
            beforeEnter: isUnauthenticated,
        },
        {
            path: '/cart',
            component: () => import('../views/CartView.vue'),
            beforeEnter: isAuthenticated(),
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
    ],
    scrollBehavior(){
        return {
            top: 0,
            behavior: 'smooth',
        };
    },
});

export default router;

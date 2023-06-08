import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

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
        },
        {
            path: '/search',
            name: 'search',
            component: () => import('../views/SearchView.vue')
        },
        {
            path: '/user',
            redirect: '/signin',
        },
        {
            path: '/signin',
            component: () => import('../views/LoginView.vue'),
        },
        {
            path: '/cart',
            component: () => import('../views/CartView.vue'),
        },
        {
            path: '/payment',
            component: () => import('../views/PaymentView.vue'),
        },
        {
            path: '/purchase/:id',
            name: 'purchase',
            component: () => import('../views/PurchaseView.vue'),
        },
        {
            path: '/signup',
            component: () => import('../views/SignUpView.vue'),
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

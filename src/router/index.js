import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '@/views/common/Login.vue';
import CodeList from '@/views/common/CodeList.vue';
import MenuInfo from '@/views/common/MenuInfo.vue';
import MenuInfoRegister from '@/views/common/MenuInfoRegister.vue';
import InfoList from '@/views/common/ScreenList.vue';
import InfoRegister from '@/views/common/ScreenRegister.vue';
import UserInfo from '@/views/common/UserList.vue';
import Summary from '@/views/common/Summary.vue';

//import FinanceTable from '@/views/business/FinanceTable.vue';
import FinanceTableTree from '@/views/business/FinanceTableTree.vue';
import AccountInfo from '@/views/business/AccountInfo.vue';
import AccountInfoRegister from '@/views/business/AccountInfoRegister.vue';
import FinanceDetail from '@/views/business/FinanceDetail.vue';
import FinancePrice from '@/views/business/FinancePrice.vue';
import FinanceDetailRegister from '@/views/business/FinanceDetailRegister.vue';
import CompanyInfo from '@/views/business/CompanyInfo.vue';
import CompanyInfoRegister from '@/views/business/CompanyInfoRegister.vue';
import Report from '@/views/business/Report.vue';
import store from '@/store';

Vue.use(VueRouter);

const routes = [{
    path: '/summary',
    name: 'summary',
    component: Summary
  },
  {
    path: '/',
    name: 'financeTable',
    component: FinanceTableTree
  },
  {
    path: '/codeInfo/:codetype',
    name: 'codeList',
    component: CodeList
  },
  {
    path: '/accountInfo',
    name: 'accountInfo',
    component: AccountInfo
  },
  {
    path: '/financeDetail',
    name: 'financeDetail',
    component: FinanceDetail
  },
  {
    path: '/financeDetailRegister',
    name: 'financeDetailRegister',
    component: FinanceDetailRegister
  },
  {
    path: '/accountInfoRegister',
    name: 'accountInfoRegister',
    component: AccountInfoRegister
  },
  {
    path: '/companyInfo',
    name: 'companyInfo',
    component: CompanyInfo
  },
  {
    path: '/companyInfoRegister',
    name: 'companyInfoRegister',
    component: CompanyInfoRegister
  },
  {
    path: '/menuInfo',
    name: 'menuInfo',
    component: MenuInfo
  },
  {
    path: '/menuInfoRegister',
    name: 'menuInfoRegister',
    component: MenuInfoRegister
  },
  {
    path: '/infoList/:screenId/:screenTitle',
    name: 'infoList',
    component: InfoList
  },
  {
    path: '/infoRegister',
    name: 'infoRegister',
    component: InfoRegister
  },
  {
    path: '/userInfo',
    name: 'userInfo',
    component: UserInfo
  },
  {
    path: '/financePrice',
    name: 'financePrice',
    component: FinancePrice
  },
  {
    path: '/report',
    name: 'report',
    component: Report
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      allowAnonymous: true
    }
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  if (store.state.accessToken == "" && to.path !== "/login") {
    next('/login');
  } else {
    next();
  }
});

export default router;

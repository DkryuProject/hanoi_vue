import '@babel/polyfill';
import 'mutationobserver-shim';
import Vue from 'vue';
import './plugins/axios';
import Main from '@/Main.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import 'material-design-icons-iconfont/dist/material-design-icons.css'; // Ensure you are using css-loader
import '@mdi/font/css/materialdesignicons.css'; // Ensure you are using css-loader
import gAuth from 'vue-google-oauth2';
import * as filters from './common/filter.js';
import VueCookies from 'vue-cookies';
import axios from 'axios';
import money from 'v-money';
import VueLoading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import VueGoogleCharts from 'vue-google-charts';
import TreeDataTable from 'v-tree-data-table';
Vue.component('v-tree-data-table', TreeDataTable);

Vue.config.productionTip = false;

Object.keys(filters).forEach(function(key) {
  Vue.filter(key, filters[key]);
});

const gauthOption = {
  clientId: '368480902820-5sod3kk9s3f2ouqg7e4dljfks3r22v6g.apps.googleusercontent.com',
  scope: 'profile email',
  prompt: 'select_account',
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_secret: "2_fr8iBK8GJEBGDXcb8yW18D"
};

Vue.use(gAuth, gauthOption);
Vue.use(VueCookies);
Vue.use(money);
Vue.use(VueLoading);
Vue.use(VueGoogleCharts);

axios.defaults.baseURL = process.env.VUE_APP_BACKEND_URL;
axios.defaults.headers.common.Accept = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.post['Access-Control-Allow-Methods'] = 'POST, GET, PUT, OPTIONS, DELETE';
axios.defaults.headers.post['Access-Control-Allow-Headers'] = 'Access-Control-Allow-Methods, Access-Control-Allow-Origin, Origin, Accept, Content-Type';

new Vue({
  router,
  store,
  vuetify,
  icons: {
    iconfont: 'mdi',
  },
  render: h => h(Main)
}).$mount('#app');

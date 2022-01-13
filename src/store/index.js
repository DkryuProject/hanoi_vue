import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    accessToken: '',
    sessionId: '',
    email: '',
    name: '',
    imageUrl: '',
    role: ''
  },
  mutations: {
    loginData : function (state, data){
      state.sessionId   = data.email;
      state.name        = data.name;
      state.email       = data.email;
      state.imageUrl    = data.imageUrl;
      state.accessToken = data.accessToken;

      if(process.env.VUE_APP_ADMIN_USER.includes(data.email)){
        state.role = "ADMIN";
      }
    },
    logout : function (state){
      state.sessionId   = "";
      state.name        = "";
      state.email       = "";
      state.imageUrl    = "";
      state.accessToken = "";
      state.role        = "";
    },
  },
  actions: {
  },
  modules: {
  }
});

<template>
<div id="login">
  <v-content v-show="this.isLoaded == true">
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col class="text-center">
          <v-card center v-show="this.isloginCheck == false && this.isUserCheck == false">
            <v-card-title>Login</v-card-title>
            <v-card-text>
              Only Google can log in.
            </v-card-text>
            <v-card-actions>
              <v-img @click="login()" src="@/assets/btn_google_signin.png"></v-img>
            </v-card-actions>
          </v-card>
          <v-card center v-show="this.isUserCheck == true && this.isReqestApploval == false">
            <v-card-title>Request for approval</v-card-title>
            <v-card-text>
              You can log in after requesting approval.
              Please sign in to Google for approval.
            </v-card-text>
            <v-card-actions>
              <v-btn @click="aprovalReuest()">Request for approval</v-btn>
            </v-card-actions>
          </v-card>
          <v-card center v-show="this.isReqestApploval == true">
            <v-card-title>Completed approval request completed</v-card-title>
            <v-card-text>
              Your request for approval has been completed.
              Please sign in later.
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-content>
</div>
</template>

<script>
export default {
  name: 'login',
  data() {
    return {
      isLoaded: false,
      isloginCheck: false,
      isUserCheck: false,
      isReqestApploval: false,
      userData: {}
    }
  },
  watch: {
    isLoaded: {
      handler: function(value) {
        if (value) {
          this.loginCheck();
        }
      }
    },
    isloginCheck: {
      handler: function(value) {
        if (value) {
          this.moveMainPage();
        }
      }
    }
  },
  methods: {
    login() {
      this.$gAuth.signIn()
        .then(user => {
          this.userData = {
            id: user.getId(),
            userId: user.getBasicProfile().getEmail(),
            name: user.getBasicProfile().getName(),
            email: user.getBasicProfile().getEmail(),
            imageUrl: user.getBasicProfile().getImageUrl(),
            accessToken: user.getAuthResponse().access_token
          };

          const userCheck = new Promise((resolve) => {
            this.$axios.get("/api/v1/user/"+this.userData.userId)
              .then(response => {
                resolve(response);
              })
              .catch((ex) => {
                console.warn("ERROR!!!!! : ", ex)
              })
          });

          userCheck.then(response => {
            console.log(response);
            if (response.data.length == 0) {
              this.isUserCheck = true;
            } else {
              if (!response.data.user_status) {
                alert("It has not been approved.\nPlease contact your administrator.");
                return;
              } else {
                this.insertLoginData();
              }
            }
          }).catch(error => {
            console.log(error);
          })
        })
        .catch(error => {
          console.log(error)
        })
    },
    insertLoginData() {
      this.$axios.post("/api/v1/login/insert", JSON.stringify(this.userData))
        .then(response => {
          this.$store.commit('loginData', response.data);
          this.$cookies.set("dhgToken", response.data.accessToken, -1);
          this.$router.push("/");
        })
        .catch((ex) => {
          console.warn("ERROR!!!!! : ", ex)
        })
    },
    aprovalReuest() {
      this.$axios.post("/api/v1/login/userApprovalRequest", JSON.stringify(this.userData))
        .then(response => {
          if (response.status == "200") {
            this.isReqestApploval = true;
          }
        })
        .catch((ex) => {
          console.warn("ERROR!!!!! : ", ex)
        })
    },
    moveMainPage() {
      this.$axios.post("/api/v1/login/insertHistory", JSON.stringify(this.$store.state))
        .then(response => {
          console.log(response);
          this.$router.push("/");
        })
        .catch((ex) => {
          console.warn("ERROR!!!!! : ", ex)
        })
    },
    loginCheck() {
      console.log("accessToken===" + this.$cookies.get("dhgToken"));
      this.$axios.get(process.env.VUE_APP_BACKEND_URL + "/api/v1/login/"+this.$cookies.get("dhgToken"))
        .then(response => {
          console.log(response.data);
          if (response.data.length !== 0) {
            if (!response.data.user.user_status) {
              this.isloginCheck = false;
            } else {
              this.$store.commit('loginData', response.data);
              this.isloginCheck = true;
            }
          } else {
            this.isloginCheck = false;
          }
        })
        .catch((ex) => {
          console.warn("ERROR!!!!! : ", ex)
        })
    }
  },
  mounted() {
    let that = this;
    let checkGauthLoad = setInterval(function() {
      that.isLoaded = that.$gAuth.isLoaded();
      if (that.isLoaded) clearInterval(checkGauthLoad)
    }, 500);
  }
}
</script>

<style scoped>
#login {
  width: 500px;
  margin: auto;
  margin-top: 200px;
  padding: 20px;
}
</style>

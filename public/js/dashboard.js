// public
import{ createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
createApp({
  data(){
    return {
      name: '',
      password: '',
      pic: null,
      loginCookie: '',
      cLogin: '',
      cPw: '',
      cImage: null,
      error: '',
      showLoginForm: true,
      showRegisterForm: false,
    }
  },
  methods: {
    loadFile(e) {
    const fileLink = e.target.files[0] // event.target.files[0] is the current File
    const reader = new FileReader() 
    reader.onload = () => {
    this.pic = reader.result // when finished loading, pic is set to result
    }
    reader.readAsDataURL(fileLink) // Start reading file
    },
    register(){
      this.error = ''
      fetch('/api/user',{
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          name: this.name,
          password: this.password,
          pic: this.pic
        })
      })      
      .then(res => res.json())
      .then(data => {
        if(data.error) this.error = data.error
      })
    },
    login(){
      this.error = ''
      fetch('/api/login',{
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          name: this.name,
          password: this.password,
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log(data)
        if(data.error) {
          this.error = data.error
        }
        else{
          console.log('I AM HERE')
          location.reload()
        }
      })
    },
    toggleForms() {
      this.showLoginForm = !this.showLoginForm;
      this.showRegisterForm = !this.showRegisterForm;
      this.error = ''
    }
  }, mounted() {
    setInterval(() => {
      this.loginCookie = document.cookie.split('userid=')[1]
      if (this.loginCookie) {
        fetch('/api/user')
          .then(res => res.json())
          .then(data => {
            this.cLogin = data.name
            this.cPw = data.password
            this.cImage = data.pic
          })
        }
    }, 1000)
  }
}).mount('#app')
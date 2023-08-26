// private
import{ createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
    createApp({
      data(){
        return {
          loginCookie: '',
          cLogin: '',
          cPw: '',
          cImage: null,
          asteroids: [],
          pic: null,
          curiosity: null,
          myChart: null,
          filter: '',
          names: [],
          diameters: [],
          searchTerm: '',
          searchResult: null,
          newAstereoid: {
            name: 'name',
            estimated_diameter: {
              estimated_diameter_min: 123, 
              estimated_diameter_max: 456
            },
            absolute_magnitude_h: 10
          },
          chart1: false,
          chart2: false
        }
      },
      methods: {
        loadAsteroids() {
          fetch('/api/nasa')
            .then(response => response.json())
            .then(data => {
              this.asteroids = data
              console.log(this.asteroids)
            })
        },
        loadPicture() {
          fetch('/api/nasa/pic')
            .then(response => response.json())
            .then(data => {
              this.pic = data
            })
        },
        loadCuriosity() {
          fetch('/api/nasa/curiosity')
            .then(response => response.json())
            .then(data => {
              this.curiosity = data
            })
        },
        renderChart1(){
          const xValues = [];
          const yValues = [];  
          for (let [i, elem] of this.asteroids.entries()){
              xValues[i] = elem.name
              yValues[i] = elem.estimated_diameter.estimated_diameter_max
            }

          console.log(xValues, yValues)
          new Chart("chart", {
            type: "bar",
            data: {
              labels: xValues,
              datasets: [{
                label: 'estimated_diameter_max',
                fill: false,
                lineTension: 0,
                backgroundColor: "rgba(0,0,255,1.0)",
                borderColor: "rgba(0,0,255,0.1)",
                data: yValues
              }]
            },
            options: {
              legend: {display: false},
              x: {
                type: 'linear'
            },
            y: {
                type: 'linear'
            }
            }
          });
        },
        searchAsteroid() {
          const searchedAsteroid = this.asteroids.filter(asteroid => asteroid.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
          
          if (searchedAsteroid) {
            this.searchResult = searchedAsteroid
            console.log('Found asteroid:', JSON.stringify(this.searchResult));
          } else {
            console.log('Asteroid not found');
          }
        },    
        createAstereoid() {
          const astereoid = this.newAstereoid
          console.log(JSON.stringify(astereoid))
          fetch('/api/nasa', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(astereoid)
          })
            .then(response => response.json())
            .then(data => {
              console.log(`added astereoid: ${JSON.stringify(data)}`)
              this.loadAsteroids()
            })
        },
        updateAsteroid(index) {
          const asteroidToUpdate = this.searchResult[index]
          console.log(index, asteroidToUpdate)
          fetch('/api/nasa', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(asteroidToUpdate)
          })
            .then(response => response.json())
            .then(data => {
              console.log(`update to astereoid: ${JSON.stringify(data)}`)
              this.loadAsteroids()
            })
        },
        deleteAsteroid(index) {
          const asteroidToDelete = this.searchResult[index]
          fetch('/api/nasa', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(asteroidToDelete)
          })
            .then(response => response.json())
            .then(data => {
              console.log(`Deleted student: ${JSON.stringify(data)}`)
              this.loadAsteroids()
            })
        },
        renderChart2 (){
          const xValues = [];
          const yValues = [];

          for (let [i, elem] of this.asteroids.entries()){
            xValues[i] = elem.name
            yValues[i] = elem.absolute_magnitude_h
          }

          new Chart("myChart", {
            type: "line",
            data: {
              labels: xValues,
              datasets: [{
                label: 'absolute_magnitude_h',
                fill: false,
                lineTension: 0,
                backgroundColor: "rgba(0,0,255,1.0)",
                borderColor: "rgba(0,0,255,0.1)",
                data: yValues
              }]
            },
            options: {
              legend: {display: false},
              x: {
                type: 'linear'
            },
            y: {
                type: 'linear'
            }
            }
          });
        },
        handleLogout(){
          document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'userid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          window.location.replace('/')
        }
      }, mounted() {
        this.loadAsteroids()
        this.loadPicture()
        this.loadCuriosity()
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
      
      if (this.asteroids != null && this.chart1 == false){
        this.renderChart1()
        this.chart1 = true
      }

      if (this.asteroids != null && this.chart2 == false){
        this.renderChart2()
        this.chart2 = true
      }
      
    }, 1000)
      }
    }).mount('#app1')
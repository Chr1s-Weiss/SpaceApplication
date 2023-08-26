const express = require('express')
const { MongoClient} = require('mongodb')
const cookieParser = require('cookie-parser')
const mongodb = require('mongodb')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const connectionString = 'mongodb://127.0.0.1:27017'
const nasakey = 'zoP9eysNUy1xH6ZugFy5ODLDCvX7ReZuqOww8IsP'

const app = express()
const port = 9000

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extend: true}))
app.use(express.json())
app.use(cookieParser())

const salt = 'abc123' // Some randomness for hashing 

// TODO: function in seperate file + export. require in this file
async function storeNew(res, newName, newPassword, newPic){
  const client = new MongoClient(connectionString)
  try{
      const db = client.db('project')
      const userCollection = db.collection('users')

      const hash = crypto.pbkdf2Sync(newPassword, salt, 1000, 64, 'sha512').toString('hex')

      const existUsername = await userCollection.findOne({ name: newName});
      if (existUsername) {
        res.json({error: 'username already taken'})
        return
      }
      const authValue = 'SUPERSECRETCHOKOLATE';

      const insertedUser = await userCollection.insertOne({name: newName, password: hash, pic: newPic})
      res.cookie('userid', insertedUser.insertedId.toString(), {sameSite: 'lax'})
      res.cookie('auth', authValue, { maxAge: 86400000, sameSite: 'lax' });
      res.json(insertedUser)
      //res.redirect('/');
      //next()
  } catch(err){
      console.log(`an error occured: ${err}`)
      res.send(`an error occured: ${err}`) // leitet error an client
  } finally{
      await client.close()
  }
}

async function loadData(res, cookie) {
  const client = new MongoClient(connectionString)
  try {
    const db = client.db('project')
    const users = db.collection('users')
    const allusers = await users.find({}).toArray()

    allusers.forEach(cUser => {
      if (cUser._id.toString() === (new mongodb.ObjectId(cookie)).toString()) {
        res.json(cUser)
      }
    })
  } catch (err) {
    console.log(`an error occured: ${err}`)
    res.json()
  } finally {
    await client.close()
  }
}

async function check(res, name, password) {
  const client = new MongoClient(connectionString)
  try {
    const db = client.db('project')
    const users = db.collection('users')
    const allusers = await users.find({}).toArray()

    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')

    const authValue = 'SUPERSECRETCHOKOLATE';

    allusers.forEach(cUser => {
      if (cUser.name === name && cUser.password === hash) {
        res.cookie('userid', cUser._id.toString(), { sameSite: 'lax' })
        res.cookie('auth', authValue, { maxAge: 86400000, sameSite: 'lax' });
        res.json(cUser)
        return
      }
    })
    res.json({error: 'Wrong username or password'})
    return
  } catch (err) {
    console.log(`an error occured: ${err}`)
    res.json()
  } finally {
    await client.close()
  }
}

app.get('/', (req, res, next) => {
  if(!req.cookies.auth) {
    return res.sendFile(path.join(__dirname, 'public', 'login.html'))
  } 
  next()
}) 

app.post('/api/user', (req, res) => {
  const newName = req.body.name
  const newPassword = req.body.password
  let newPic = req.body.pic

  const base64Data = newPic.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')

  storeNew(res, newName, newPassword, buffer.toString('base64'))
})

app.post('/api/login', (req, res) => {
  const login = req.body.name
  const pw = req.body.password
  check(res, login, pw)
})

app.get('/api/user', (req, res) => {
  if (req.cookies) {
    loadData(res, req.cookies.userid)
  }
})

function checkCookie(req, res, next) {
  if(!req.cookies){
    res.status(401).send('unauthorized')
  }

  const auth = req.cookies.auth
  if(auth == 'SUPERSECRETCHOKOLATE'){
    next() // next is only executed when cookie is set
  } else {
    res.status(401).send('unauthorized')
  }
}
app.use('', checkCookie, express.static(path.join(__dirname, 'private')))

async function loadAsteroids(res) {
  const client = new MongoClient(connectionString)
  try{
    const db = client.db('project')

    const insertedAsteroids = await db.collection('asteroids').find({}).toArray()
    res.json(insertedAsteroids)
  } catch (error) {
    console.log(`An error occured in loadAsteroids: ${error}`)
  } finally{
    await client.close()
  }
}

async function loadPic(res) {
  const client = new MongoClient(connectionString)
  try{
    const db = client.db('project')

    const insertedAsteroids = await db.collection('pictures').find({type: "Picture"}).toArray()
    res.json(insertedAsteroids)
  } catch (error) {
    console.log(`An error occured in loadAsteroids: ${error}`)
  } finally{
    await client.close()
  }
}

async function loadCuriosity(res) {
  const client = new MongoClient(connectionString)
  try{
    const db = client.db('project')

    const images = await db.collection('curiosity').find({type: "Picture"}).toArray()
    res.json(images)
  } catch (error) {
    console.log(`An error occured in loadAsteroids: ${error}`)
  } finally{
    await client.close()
  }
}

async function createAstereoid(newAsteroid, res) {
  const client = new MongoClient(connectionString)
  try{
    const db = client.db('project')
    const asteroids = db.collection('asteroids')
    console.log(newAsteroid)
    let insertedAsteroids = await asteroids.insertOne({name: newAsteroid.name, absolute_magnitude_h: newAsteroid.absolute_magnitude_h, estimated_diameter: {estimated_diameter_min: newAsteroid.estimated_diameter.estimated_diameter_min, estimated_diameter_max: newAsteroid.estimated_diameter.estimated_diameter_max}})
    res.json(insertedAsteroids)
  } catch (error) {
    console.log(`An error occured: ${error}`)
  } finally{
    await client.close()
  }
}

async function updateAsteroid(updateAsteroid, res) {
  const client = new MongoClient(connectionString)
  try{
    const db = client.db('project')
    const asteroids = db.collection('asteroids')

    let insertedAsteroids = await asteroids.updateOne({_id: new mongodb.ObjectId(updateAsteroid._id)}, {$set: {name: updateAsteroid.name}})
    res.json(insertedAsteroids)
  } catch (error) {
    console.log(`An error occured: ${error}`)
  } finally{
    await client.close()
  }
}

async function deleteAsteroid(id, res) {
  const client = new MongoClient(connectionString)
  try{
    const db = client.db('project')
    const asteroids = db.collection('asteroids')

    let deletedAsteroids = await asteroids.deleteMany({_id: new mongodb.ObjectId(id)})
    res.json(deletedAsteroids)
  } catch (error) {
    console.log(`An error occured: ${error}`)
  } finally{
    await client.close()
  }
}

app.get('/api/nasa', (req, res) => {
  loadAsteroids(res)
})

app.get('/api/nasa/pic', (req, res) => {
  loadPic(res)
})

app.get('/api/nasa/curiosity', (req, res) => {
  loadCuriosity(res)
})

app.post('/api/nasa', (req, res) => {
  console.log(req)
  const newAsteroid = req.body
  createAstereoid(newAsteroid, res)
})

app.put('/api/nasa', (req, res) => {
  const newAsteroid = req.body
  updateAsteroid(newAsteroid, res)
})

app.delete('/api/nasa', (req, res) => {
  const id = req.body._id
  deleteAsteroid(id, res)
})

async function nasaCollection(name, url){
  const client = new MongoClient(connectionString)
  try{
    const db = client.db('project')
    const nasa = db.collection('pictures')
    const name = 'pic1'

    binImg = await fetch(`${url}${nasakey}`)
    const blob = await binImg.blob()
    const arrayBuffer = await blob.arrayBuffer() // convert to buffer
    const buffer = Buffer.from(arrayBuffer)
    fs.writeFileSync('test.png', buffer) // Assuming image is a png, test if image was coded correctly
    const imageasstring = buffer.toString('base64')

    const status = await nasa.insertOne({name: name, type: 'Picture', image: imageasstring})
    console.log(`\nNew Status: ${JSON.stringify(status)}`)
  }catch (error) {
    console.log(`An error occured: ${error}`)
  } finally{
    await client.close()
  }
}

async function initDBAsteroids() {
  const client = new MongoClient(connectionString)
  try{
    const db = client.db('project')
    const asteroids = db.collection('asteroids')

    let res = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=2023-06-06&end_date=2023-06-13&api_key=${nasakey}`)
    if (res.ok){
      res = await res.json()
    }
    else throw Error(res.statusText)
    for (let [day, value] of Object.entries(res.near_earth_objects)){
      value.map( async (object) => {
        let asteroid = {
          name: object.name,
          day: day,
          estimated_diameter: object.estimated_diameter.meters,
          absolute_magnitude_h: object.absolute_magnitude_h
        }
        const client = new MongoClient(connectionString)
        const db = client.db('project')
        const asteroids = db.collection('asteroids')
        const status = await asteroids.insertOne(asteroid)
        console.log(status)
      })
    }
  } catch (error) {
    console.log(`An error occured: ${error}`)
  } finally{
    await client.close()
  }
}

async function initDBCuriosity(){
  const client = new MongoClient(connectionString)
  try{
    const db = client.db('project')
    const nasa = db.collection('curiosity')

    let res = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=${nasakey}`)
    if (res.ok){
      res = await res.json()
    }
    else throw Error(res.statusText)
    console.log(res)
    for (let [idx, photo] of Object.entries(res.photos)){
      console.log(photo)
      let url = photo.img_src
      let id = photo.id

      binImg = await fetch(url)
      const blob = await binImg.blob()
      const arrayBuffer = await blob.arrayBuffer() // convert to buffer
      const buffer = Buffer.from(arrayBuffer)
      fs.writeFileSync('test.jpeg', buffer) // Assuming image is a png, test if image was coded correctly
      const imageasstring = buffer.toString('base64')
  
      const status = await nasa.insertOne({id: id, type: 'Picture', image: imageasstring})
      console.log(`\nNew Status: ${JSON.stringify(status)}`)
      if (idx > 9) break
    }


  }catch (error) {
    console.log(`An error occured: ${error}`)
  } finally{
    await client.close()
  }
}


// nasaCollection('pic2', 'https://api.nasa.gov/planetary/earth/imagery?lon=110.75&lat=15&date=2014-02-01&api_key=')
// nasaCollection('pic3', 'https://api.nasa.gov/planetary/earth/imagery?lon=50.75&lat=15&date=2014-02-01&api_key=')
// initDBCuriosity()

// Initial database filling
// initDBAsteroids() 
// https://api.nasa.gov/planetary/earth/assets?lon=47.72&lat=13.08&date=2023-06-12&&dim=0.10&api_key=zoP9eysNUy1xH6ZugFy5ODLDCvX7ReZuqOww8IsP
// https://api.nasa.gov/planetary/earth/imagery?lon=110.75&lat=15&date=2014-02-01&api_key=
// https://api.nasa.gov/planetary/earth/imagery?lon=50.75&lat=15&date=2014-02-01&api_key=

// Start server
app.listen(port, () => {
  console.log(`Server started on http://127.0.0.1:${port}`)
})
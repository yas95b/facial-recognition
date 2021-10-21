const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex= require('knex');
const { response } = require('express');
 
const db = knex({
    client: 'pg',
    connection: {
      host : 'postgresqlpostgis',
      user : 'postgres',
      password: 'test',
      database : 'smartbrain'
    }
  });

const app = express();

app.use(bodyParser.json());
app.use(cors())

app.get('/', (req, res) =>{
    res.send(database.users);
})

app.post('/signin', (req, res) =>{
    db.select('email', 'hash').from('logins')
    .where('email', '=', req.body.email)
    .then(data => {
       const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
       if (isValid){
          return db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
       }else{
        response.status(400).json('Wrong Credentials')

       }
    })
    .catch(err => res.status(400).json('Wrong Credentials'))
})

app.post('/register', (req, res) =>{
    const {email, name, password} = req.body;
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('logins')
        .returning('email')
        .then(loginEmail =>{
        return trx('users')
        .returning('*')
        .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
        })
        .then(user => { 
            res.json(user[0]);
        })        
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
})

//loop through sample database and find the matching id if matches return user
app.get('/profile/:id' , (req, res) => {
    const { id } = req.params;
    db.select('*').from('users').where({id})
        .then(user => {
        if (user.length){
            res.json(user[0])
        } else{
            res.status(400).json('Not found')     
        }
        })      
        .catch(err => res.status(400).json('Error getting user'))
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    })
    //In case of error
    .catch(err => res.status(400).json('unable to get entries'))
})


app.listen(3000, ()=>{
console.log('app is running on port 3000');
})


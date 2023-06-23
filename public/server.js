const express = require('express')
const app = express()
const path = require('path')


app.use(express.json())

//for setting up rollbar in our server
let Rollbar = require('rollbar')
let rollbar = new Rollbar({
  accessToken: 'fabfabb1b31848919b481d11fa08ab17',
  captureUncaught: true,
  captureUnhandledRejections: true,
})

rollbar.log('Hello world!')

const students = ['Jimmy', 'Timothy', 'Jimothy']

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/api/students', (req, res) => {
    res.status(200).send(students)
    rollbar.log(`student list sent`)
})

app.post('/api/students', (req, res) => {
   let {name} = req.body
   rollbar.log(req.body)

   const index = students.findIndex(student => {
       return student === name
   })

   try {
       if (index === -1 && name !== '') {
           students.push(name)
           rollbar.info(`new student added`)
           res.status(200).send(students)
       } else if (name === ''){
           res.status(400).send('You must enter a name.')
           rollbar.critical(`attempted empty name`)
       } else {
           rollbar.error(`attempted duplicate studen`)
           res.status(400).send('That student already exists.')
       }
   } catch (err) {
       console.log(err)
   }
})

app.delete('/api/students/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    students.splice(targetIndex, 1)
    res.status(200).send(students)
})

const port = process.env.PORT || 5050

app.listen(port, () => console.log(`Server listening on ${port}`))

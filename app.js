const express = require('express')

const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()

app.use(express.json())

const dpath = path.join(__dirname, 'moviesData.db')

let db = null
const server = async () => {
  try {
    db = await open({filename: dpath, driver: sqlite3.Database})

    app.listen(3000, () => {
      console.log('successfully connected')
    })
  } catch (e) {
    console.log(`some error ${e}`)
    process.exit(1)
  }
}

server()

app.get('/movies/', async (request, response) => {
  const dbqurey = `SELECT movie_name FROM movie;`

  const result = await db.all(dbqurey)

  response.send(result.map(eachMovie => ({movieName: eachMovie.movie_name})))
})

app.post('/movies/', async (request, response) => {
  const dbdetails = request.body

  const {directorId, movieName, leadActor} = dbdetails

  const dbquery = `INSERT INTO movie (director_id,movie_name,lead_actor)
                    VALUES (${directorId},'${movieName}','${leadActor}');`

  await db.run(dbquery)

  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const dbquery = `SELECT * FROM movie WHERE movie_id = ${movieId};`
  const result = await db.get(dbquery)

  if (result) {
    response.send({
      movieId: result.movie_id,
      directorId: result.director_id,
      movieName: result.movie_name,
      leadActor: result.lead_actor,
    })
  } else {
    response.status(404).send('Movie Not Found')
  }
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const dbdetails = request.body
  const {directorId, movieName, leadActor} = dbdetails

  const dbquery = `UPDATE movie SET director_id=${directorId},
  movie_name='${movieName}',lead_actor='${leadActor}' WHERE movie_id=${movieId};`

  await db.run(dbquery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const dbquery = `DELETE FROM movie WHERE movie_id=${movieId};`

  await db.run(dbquery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const dbquery = `SELECT * FROM director;`

  const result = await db.all(dbquery)

  response.send(
    result.map(each => ({
      directorId: each.director_id,
      directorName: each.director_name,
    })),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const dbquery = `SELECT movie.movie_name FROM movie inner join director
  on movie.director_id = director.director_id WHERE movie.director_id=${directorId};`

  const result = db.get(dbquery)

  response.send(result.movie_name)
})

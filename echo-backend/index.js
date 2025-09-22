import express from 'express';
import { Client } from 'pg'
 

const app = express()

const client = new Client({
  user: 'database-user',
  password: 'secretpassword!!',
  host: 'my.database-server.com',
  port: 5334,
  database: 'database-name',
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`)
})

import express from 'express'
import pkg from 'pg'
const { Pool } = pkg
import cors from 'cors'
import 'dotenv/config'
import axios from 'axios'

const app = express()
const PORT = process.env.PORT || 3000
const bsaleURL = 'https://api.bsale.io/'
app.use(cors())
app.use(express.json())

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
})

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} a ${req.url}`)
  console.log('User-Agent:', req.headers['user-agent'])
  next()
})

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ APIstatus: 'OK', BDstatus: 'Conectada' })
  } catch (err) {
    res.status(500).json({ APIstatus: 'OK', BDstatus: 'Error', error: err.message })
  }
})

app.post('/webhook', async (req, res) => {
  try {
    const webhookToken = req.headers['access-token']
    if (webhookToken !== process.env.BSALE_TOKEN_WEBHOOK) {
      console.error('Error en Webhook: Webhook no autorizado')
      return res.status(401).send('No autorizado')
    }
    const data = req.body
    if (!data || Object.keys(data).length === 0) {
      console.error('Error en Webhook: Sin data recibida')
      return res.status(400).send('No data received')
    }
    const query = 'INSERT INTO "public"."logs_webhooks" ("Data") VALUES ($1)'
    await pool.query(query, [JSON.stringify(data)])
    res.status(200).json({ received: true })
  } catch (err) {
    console.error('Error en Webhook:', err.message)
    res.status(500).send('Internal Server Error:')
  }
})

app.get('/datos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "public"."logs_webhooks"')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/datos/documentos', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "public"."logs_webhooks" WHERE "Data"->> \'topic\' = \'document\'',
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/datos/stocks', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "public"."logs_webhooks" WHERE "Data"->> \'topic\' = \'stock\'',
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/datos/productos', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "public"."logs_webhooks" WHERE "Data"->> \'topic\' = \'product\'',
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/datos/variantes', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "public"."logs_webhooks" WHERE "Data"->> \'topic\' = \'variant\'',
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/datos/precios', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "public"."logs_webhooks" WHERE "Data"->> \'topic\' = \'price\'',
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/datos/referencias', async (req, res) => {
  const referencia = req.headers
  if (!referencia) {
    res.status(500).json({ error: 'falta referencia', tuheardes: referencia })
  }
  try {
    const response = axios.get(bsaleURL + referencia, {
      headers: {
        'access-token': process.env.BSALE_ACCESS_WEBHOOK,
      },
    })
    res.status(500).json({ datos: response })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Servidor API corriendo en el puerto ${PORT}`)
})

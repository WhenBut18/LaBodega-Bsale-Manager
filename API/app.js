import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import 'dotenv/config';
// Para leer archivo .env localmente

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS para permitir peticiones desde tu web
app.use(cors());
app.use(express.json());

// Configuración del Pool de PostgreSQL
// En cPanel, estos valores se configuran en "Environment Variables"
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Ruta de prueba para verificar que la API responde
app.get('/api/health', (req, res) => {
    res.json({ status: 'API funcionando correctamente' });
});

// Ejemplo de endpoint para obtener datos
app.get('/api/datos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM TEST LIMIT 10');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al conectar con la base de datos' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor API corriendo en el puerto ${PORT}`);
});
import express, { Request, Response } from 'express';
import { Pool } from 'pg';

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

// Root - basic info
app.get('/', (_req: Request, res: Response) => {
  res.json({ app: 'vulnerable-test-app', version: '1.0.0' });
});

// VULNERABLE: direct equality injection via query param — scanner can detect this
app.get('/users', async (req: Request, res: Response) => {
  const id = req.query.id as string;
  try {
    const result = await pool.query(`SELECT id, username, email FROM users WHERE id = ${id}`);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// VULNERABLE: direct equality via query param
app.get('/search', async (req: Request, res: Response) => {
  const q = req.query.q as string;
  try {
    const result = await pool.query(`SELECT * FROM products WHERE name = '${q}'`);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// VULNERABLE: filter by name
app.get('/filter', async (req: Request, res: Response) => {
  const name = req.query.name as string;
  try {
    const result = await pool.query(`SELECT * FROM users WHERE username = '${name}'`);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SAFE: parameterised — should NOT be patched
app.get('/products', async (req: Request, res: Response) => {
  const id = req.query.id as string;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));

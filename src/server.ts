import express, { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

// VULNERABLE: raw SQL string interpolation — user input injected directly into query
app.get('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM users WHERE id = ${id}`);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// VULNERABLE: concatenated SQL with user search term
app.get('/search', async (req: Request, res: Response) => {
  const term = req.query.q as string;
  try {
    const result = await pool.query(`SELECT * FROM products WHERE name LIKE '%${term}%'`);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// VULNERABLE: multi-param injection
app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`
    );
    res.json(result.rows.length > 0 ? { success: true } : { success: false });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SAFE: already parameterised — should NOT be touched by auto-fix
app.get('/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));

import { neonConfig, Pool } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import WebSocket from 'ws'

neonConfig.webSocketConstructor = WebSocket

const __dir = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(__dir, '../../db/seed/01_problems.sql'), 'utf8')

const pool = new Pool({ connectionString: process.env.POSTGRES_URL })

try {
  await pool.query(sql)
  console.log('✓ problems seeded')
} catch (e) {
  console.error('seed failed:', e.message)
  process.exit(1)
} finally {
  await pool.end()
}

import 'dotenv/config'
import { createApp } from './app.js'
import { createMysqlRepository, createPool } from './mysqlRepository.js'

const port = Number(process.env.PORT ?? 3001)

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT debe ser un número de puerto válido.')
}

const pool = createPool(process.env)
const app = createApp(createMysqlRepository(pool))

const server = app.listen(port, () => {
  console.log(`ReportaYa API disponible en http://localhost:${port}`)
})

function shutdown() {
  server.close((error) => {
    if (error) {
      console.error('Error al cerrar el servidor HTTP:', error)
      process.exitCode = 1
    }

    void pool.end().catch((poolError: unknown) => {
      console.error('Error al cerrar la conexión con MySQL:', poolError)
      process.exitCode = 1
    })
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

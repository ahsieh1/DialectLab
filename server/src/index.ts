import * as path from 'path'
import dotenv from 'dotenv'
import app from './app'

dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

const port = Number(process.env.PORT) || 3000

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

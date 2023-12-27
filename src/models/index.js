import mongoose, { connect } from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()


const dbName = `${process.env.dbName}`
const dbUrl = `${process.env.dbUrl}`

try {
    
    connect(`${dbUrl}/${dbName}`)
    console.log("Database connected Successfully")
    
} catch (error) {
    console.log(error)
}

export default mongoose
import jwt from 'jsonwebtoken'
import { jwtSecret } from '../config/env.js'
import { Types } from 'mongoose'

const generateAccessToken = async (userId: string | Types.ObjectId) =>{
    const token =  jwt.sign({id: userId.toString()}, jwtSecret!, {
        expiresIn: '5H'
    })

    return token
}

export default generateAccessToken
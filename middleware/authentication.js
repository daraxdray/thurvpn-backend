const jwt = require('jsonwebtoken')

const authMiddleware = async (req, res, next) => {
    try {
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({error : 'No authorization. Please login'})
        }

        const token = auth.split(' ')[1]

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        req.user = decoded

        next()

    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Unauthorized', error : error.message})
    }
}

module.exports = authMiddleware
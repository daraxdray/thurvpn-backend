const jwt = require('jsonwebtoken')
const User = require('../model/users');

const authMiddleware = async (req, res, next) => {
    try {
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({message : 'No authorization. Please login',status:false, data:[]})
        }

        const token = auth.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const foundUser = await User.findOne({_id:decoded.id});
        //ensure only premium users can login more than one device 
        if(!foundUser || (!foundUser.isPremium && foundUser.deviceToken != token )){
            return res.status(440).json({message : 'Device session has ended. Please login',status:false,data:null})
        }

        req.user = decoded
        next()

    } catch (error) {
        return failedResponseHandler(error,res)
    }
}

const authAdmin = async (req, res, next) => {
    try {
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({message : 'No authorization. Please login',data:[],status: false})
        }

        const token = auth.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const foundUser = await User.findOne({email:decoded.email});
        
        if(!foundUser || foundUser.isAdmin == false){
            return res.status(301).json({data:[],status:false,message:"unathorized access"});
        }

        req.user = decoded
        next()

    } catch (error) {
        failedResponseHandler(error,res)
    }
}


module.exports = {authMiddleware, authAdmin}
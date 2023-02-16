const User = require('../model/users')

exports.registerUser = async (req, res) => {
  try {
    const {email, password} = req.body

    if (!email || !password) {
        return res.status(400).json({error : `Please provide all the required parameteres.`})
    }

    const user = await User.findOne({email})

    if (user) {
        return res.status(400).json({error : `User with the email you supplied already exists.`})   
    }

    const newUser = await User.create({...req.body})

    const token = await newUser.createJWT()

    return res.status(201).json({message : 'User created successfully', data : newUser, token})
  } catch (error) {
    console.log(error)
    return res.status(500).json({message : 'Internal server error...', error : error.message}) 
  }
} 

exports.loginUser = async (req, res) => {
    try {
        const {email, password} = req.body

        if (!email || !password) {
            return res.status(400).json({error : `Please provide all the required parameters`})
        }

        const user = await User.findOne({email})

        if (!user) {
            return res.status(400).json({error : `Email does not exist, please sign up`})
        }

        const comparePasswords = await user.comparePasswords(password)

        if (!comparePasswords) {
            return res.status(400).json({error : `Wrong password provided`})
        }

        // console.log(user)

        const subscription = user.updateSubscriptionPlan()

        const token = user.createJWT()
        
        return res.status(200).json({message : 'User found', user, token, subscription})

    } catch (error) {
        console.log(error)
        return res.status(500).json({message : `Internal server error`, error : error.message})
    }
}

exports.getSingleUser = async (req, res) => {
    try {
        const {id : userId} = req.params

        if (!userId) {
            return res.status(400).json({error : 'Missing user ID'})
        }

        const user = await User.findOne({_id : userId})

        if (!user) {
            return res.status(400).json({error : `No user with the provided id`})
        }
        return res.status(200).json({message : 'User found', user})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Internal server error', error : error.message})
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})

        if (!users) {
            return res.status(404).json({error : "No users found!"})
        }

        return res.status(404).json({total_users : users.length, users})

    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Internal server error', error : error.message})
    }
}

exports.updateUser = async (req, res) => {
    try {
        const {id : userId} = req.params

        if (!userId) {
            return res.status(400).json({error : 'Missing user ID'})
        }

        const updateUser = await User.findByIdAndUpdate({_id : userId}, req.body, {new : true, runValidators : true})

        if (!updateUser) {
            return res.status(404).json({error : "User does not exist"})
        }

        return res.status(201).json({message : 'User data updated successfully', updateUser})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Internal server error', error : error.message})
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const {id : userId} = req.params

        if (!userId) {
            return res.status(400).json({error : 'Missing user ID'})
        }

        const deleteUser = await User.findByIdAndDelete(userId)

        if (!deleteUser) {
            return res.status(404).json({error : "User does not exist"})
        }

        return res.status(200).json({message : 'User deleted successfully', user_info : deleteUser})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Internal server error', error : error.message})
    }
}
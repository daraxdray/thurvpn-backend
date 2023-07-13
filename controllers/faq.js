const FAQ = require("../model/faq")

exports.createFAQ = async (req, res) => {
    try {
        const {question, answer} = req.body
        if (!question || !answer) {
            return res.status(400).json({ message: "Please provide all required fields." })
        }

        const faq = await FAQ.create({...req.body})

        return res.status(201).json({ message: "FAQ created successfully.", faq })

    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.getAllFAQs = async (req, res) => {
    try {
        const allFAQs = await FAQ.find({})

        if (!allFAQs) {
            return res.status(404).json({ message: "No FAQ found." })
        }

        return res.status(200).json({ message: "All FAQs.", total : allFAQs.length, allFAQs })
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.getSingleFAQ = async (req, res) => {
    try {

        const faq = await FAQ.findById(req.params.id)

        if (!faq) {
            return res.status(404).json({ message: "FAQ not found." })
        }

        return res.status(200).json({ message: "FAQ.", faq })
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.updateFAQ = async (req, res) => {
    try {
        const {question, answer} = req.body

        if (!question && !answer) {
            return res.status(400).json({ message: "Please provide all the required fields." })
        }

        const getFaq = await FAQ.findById(req.params.id)

        if (!getFaq) {
            return res.status(404).json({ message: "FAQ not found." })
        }

        const faq = await FAQ.findByIdAndUpdate(req.params.id, {...req.body}, {new : true, runValidators : true})

        return res.status(200).json({ message: "FAQ updated successfully.", faq })

    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.deleteFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndDelete(req.params.id)

        if (!faq) {
            return res.status(404).json({ message: "FAQ not found." })
        }

        return res.status(200).json({ message: "FAQ deleted successfully." })
    } catch (error) {
        return res.status(500).json(error.message)
    }
}
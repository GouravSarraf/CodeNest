const express = require("express");
const router = express.Router();
const {executeCode} = require("../controllers/executeFileController.js");
const {verifyAccessToken} = require("../middleware/authMiddleware.js");

router.post("/run", verifyAccessToken,async(req,res)=>{
    const {language, code, input} = req.body;
    if(!language || !code){
        return res.status(400).json({error: "Missing required fields"});
    }
    
    try{
        const result = await executeCode(language, code, input);
        res.json({success: true, result: result});
    }catch(error){
        res.status(500).json({error: error.message});
    }
}); // executeCode is a function that takes in a request and a response

module.exports = router;
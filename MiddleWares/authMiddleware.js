const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ message: "Access denied." });
        }
        const trimedToken = token.replace("Bearer ", "");

        jwt.verify(trimedToken, process.env.JWT_SECRET, (err, decoded)=>{
            if(err){
                console.log(err);
                return res.status(403).json({ message: "Invalid token" });
            }
            req.user = decoded; 
            next();
        });
    } catch (error) { 
        console.log(error);
        res.status(401).json({ message: "Invalid token" });
    }
};
 
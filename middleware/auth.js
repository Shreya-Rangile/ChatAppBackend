const jwt = require('jsonwebtoken');
const Token = require('../models/token');

function authenticateToken(req, res, next){

    console.log("Authorization function execution taking place");
    
    const authHeader = req.headers['authorization'];
    // console.log("AuthHeader is: " + authHeader);

    const token = authHeader && authHeader.split(' ')[1];
    if(token == null){
       return  res.status(401).send("Access denied");
    }

    jwt.verify(token, 'Dummy text', async (err, user) =>{
        if(err){
            console.log("JWT error ",  err);
         return res.status(403).send({ error: err, message: "Invalid or expired token.", token: token });
        }


        // const record = await Token.findOne({userToken: token});
        // console.log(record);
        // if(record && record.expirationTime <= Date.now){
        //     return res.status(401).send("Session Failed");
        // }

        // const tokenExpirationTime = jwt.decode(token).exp * 1000;
        // if(tokenExpirationTime <= Date.now()){
        //     return res.status(401).send("Session expired!");
        // }



        console.log("the received token for auth is "+ token);
        try {
            const tokenRecord = await Token.findOne({ userToken: token }).exec();
            if (!tokenRecord) {
              return res.status(401).send("token not found");
            }
      
            const currentTimestamp = Date.now();
            if (tokenRecord.expirationTime <= currentTimestamp) {
              return res.status(401).send("Session Failed and time expired ");
            }
      
            console.log("Auth complete");
            req.user = user;
            next();
          } catch (error) {
            console.log("Error fetching token record: ", error);
            return res.status(500).send("An error occurred.");
          }

        // console.log("Auth complete");
        // req.user = user;
        // next();

    });
}

module.exports = authenticateToken;
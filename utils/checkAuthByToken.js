const { verifyToken } = require("./verifyToken");
const checkUserRole = require('../utils/checkUserRole')

const checkAuthByToken = async (token, id = 0) => {

    try {
        const user_id = await verifyToken(token);
        
        if (user_id === 0) {
            return false;
        }

        if (user_id !== id ) {
            const isAdmin = await checkUserRole(user_id);
            if (isAdmin === "user") {
                return false;
            }
        }
        return user_id;

    } catch(error) {
        console.log(error)
        return false
    }

}

module.exports = checkAuthByToken;

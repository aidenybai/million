const { register, login , getallUsers, sendotp , sendEmail, changepassword} = require("../controllers/authControllers");
const { checkUser } = require("../middlewares/authMiddleware");

const router = require("express").Router();


router.post("/register", register);
router.post("/login", login);
router.get("/getallusers",getallUsers);
// router.post('/sendotp',sendotp);
router.post('/sendemail',sendEmail);
router.post('/changepassword',changepassword);
module.exports = router;

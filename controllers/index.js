
/* GET home page. */
exports.index = (req, res) => {
          return res.status(200).json({ data:[],message: "Welcome to thurvpn v1" });
}
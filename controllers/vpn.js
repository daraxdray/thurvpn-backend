let fs = require('fs');
let path = require('path');
let sha1 = require('sha1');
let os = require('os');
//import raw jsonArray for countries
let countryArray = require('./../ovpn/CountryVars.json');
let qi = require('./../ovpn/vpn/tmp.json');
const _path = './../ovpn/vpn/';


exports.getAll = async (req, res) => {
       //testing rules
       const filterVPN = (v) => {
        let __arr = [];
        Array.from(qi).filter((n) => {
            if (v === n || v === n.toString().substring(0, 2)) {
                __arr.push(req.headers.host + "/api/vpn/dwn/" + n)
            }
        })
        return __arr;
    }
    //loop and resort from .ovpn
    const filteredVpn = Array.from(countryArray);
    /**
     * perform array quick sort and file loop
     */
    let isQIOkay = false
    const result = filteredVpn.filter((raw) => {
        //algo for sorting and replacement of existing vpn files
        //reason: making app dynamics
        return raw.ovpn = filterVPN(raw.code.toLocaleLowerCase('en-US'));
    })
    //appending fullpath
    const filteredVPN = result.filter(r => r.ovpn.length > 0);
    res.json({
        user : `Welcome ${req.user.email}`,
        message: "successful",
        status: true,
        data: filteredVPN
    });
}

exports.dwn = async (req, res) => {
      //do subscription here
    /**
     * Subscription check here
     * There is going to be a header called 'user-email'
     * Check the email if the person is subscribed before you give download file access, else return not found (404)
     * This could be future access
     * But always make sure you capture the file name the user is accessing and make a record of it, for analytics purposes
     */
    //get a country code name
    const cc = req.params?.cc;
    //get a .ovpn file, load it as bytes[]
    const filePath = path.join(__dirname, _path + cc + '.ovpn');
    //register for file infos
    const stat = fs.statSync(filePath);
    //load to memory
    let file = fs.readFileSync(filePath).toString('utf-8');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=vpn_' + sha1(new Date().toISOString()).toString().slice(10) + '.ovpn');
    res.write(file, 'binary');
    res.end();
}
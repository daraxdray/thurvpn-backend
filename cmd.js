let fs = require('fs');
let path = require('path');
//////////////////////////KORGY////////////////////////////
//////// KEEP THIS LINE SAFE//////////////////////////////
//////// EXCEPT PURPOSE ONLY/////////////////////////////
let args = process.argv.slice(2);
let target = args[0];
let action = args[1];
const _path = './ovpn/vpn/';

switch (target) {
    case 'vpnfile':
        __actionLoader(action)
        break;
    default:
        console.log("Not a valid target")
}

function __actionLoader(act) {
    if (act === 'remake')
        ___temp()
    else console.log("Action not valid")
}

/**
 * make dumbs vps temp
 */
function ___temp() {
    let localArray = [];
    const ovpnFilesArray = Array.from((fs.readdirSync(path.join(__dirname, _path)))).filter((raw) => {
        localArray.push(raw.split('.')[0])
    });
    //write files to local
    fs.writeFileSync(path.join(__dirname, _path + "tmp.json"), JSON.stringify(localArray));
    console.log("New files has been written to the country list")
}

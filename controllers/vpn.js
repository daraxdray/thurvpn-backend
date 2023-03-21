let fs = require("fs");
let path = require("path");
let sha1 = require("sha1");
// let os = require("os");

const vpnModel = require("../model/vpn");
//import raw jsonArray for countries
let countryArray = require("../ovpn/CountryVars.json");
let qi = require("../ovpn/vpn/tmp.json");
const _path = "./../ovpn/vpn/";

//STALE****************
exports.getAllFileVpn = async (req, res) => {
  //testing rules
  const filterVPN = (v) => {
    let __arr = [];
    Array.from(qi).filter((n) => {
      if (v === n || v === n.toString().substring(0, 2)) {
        __arr.push(req.headers.host + "/api/vpn/dwn/" + n);
      }
    });
    return __arr;
  };
  //loop and resort from .ovpn
  const filteredVpn = Array.from(countryArray);
  /**
   * perform array quick sort and file loop
   */
  let isQIOkay = false;
  const result = filteredVpn.filter((raw) => {
    //algo for sorting and replacement of existing vpn files
    //reason: making app dynamics
    return (raw.ovpn = filterVPN(raw.code.toLocaleLowerCase("en-US")));
  });
  //appending fullpath
  const filteredVPN = result.filter((r) => r.ovpn.length > 0);

  res.json({
    message: "successful",
    status: true,
    data: filteredVPN,
  });
};

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
  const filePath = path.join(__dirname, _path + cc.toLowerCase() + ".ovpn");
  //register for file infos
  const stat = fs.statSync(filePath);
  //load to memory
  let file = fs.readFileSync(filePath).toString("utf-8");
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Content-Type", "text/plain");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=vpn_" +
      sha1(new Date().toISOString()).toString().slice(10) +
      ".ovpn"
  );
  res.write(file, "binary");
  res.end();
};
//***********END OF STALE**************

//NEW **************
exports.getServerFile = async (req, res) => {
  //do subscription here
  /**
   * Subscription check here
   * There is going to be a header called 'user-email'
   * Check the email if the person is subscribed before you give download file access, else return not found (404)
   * This could be future access
   * But always make sure you capture the file name the user is accessing and make a record of it, for analytics purposes
   */
  try{
  //get a country code name
  const {cc,slug} = req.params;
  const vpn = await vpnModel.findOne({countryCode:cc.toUpperCase()});
  
  if(!vpn){
      return res.status(400).json({data:[],status:false,message:"Unable to get vpn of provided country code"});
  }
  let regionIndex = 0;
  const region = vpn.regions.find((rg,index)=>{
    regionIndex = index;
  return  rg.slug.toLowerCase() == slug.toLowerCase();
  });
  if(!region){
    return res.status(400).json({data:[],status:false,message:"Unable to identify specified region"});
  }
  //get a .ovpn file, load it as bytes[]
  const filePath = path.join(__dirname,_path,path.basename(region.filePath));

  //load to memory
  let file = fs.readFileSync(filePath).toString("utf-8"); 

  return res.status(200).json({data:{base64:true,content:Buffer.from(file).toString('base64')}, status:true,message:"Server loaded"});
}catch(e){
  return failedResponseHandler(e,res)
}
};

exports.createVpn = async (req, res) => {
  const { country, code, image, regions, unicode } = req.body;

  try {
    if (!country || !code || !image) {
      const msg =
        (!country ? "Country name, " : "") +
        (!code ? "Country code, " : "") +
        (!image ? "Image, " : "");
      return res
        .status(400)
        .json({
          data: [],
          status: false,
          message: "Please provide required fields: " + msg,
        });
    }

      const vpnExist = await vpnModel.findOne({
          countryCode: code,
      });

    if (vpnExist) {
      return res
        .status(400)
        .json({
          data: [],
          status: false,
          message: "Vpn with country code has already been created",
        });
    }

    //validate regions
    if (regions != null && Array.isArray(regions)) {
      let msg = null;

      for (i = 0; i < regions.length; i++) {
          const region = regions[i];
        if (
          !region.regionName ||
          !region.ipAddress ||
          !region.port ||
          !region.filePath ||
          !region.slug
        ) {
          msg =
            (!region.regionName ? "Region Name, " : "") +
              (!region.ipAddress ? "Ip Address" : "") ||
            (!region.port ? "Port, " : "") ||
            (!region.filePath ? "File path" : "") ||
            (!region.slug ? "Slug" : "");
          break;
        }
      }


      if (msg != null) {
        return res
          .status(201)
          .json({
            data: [],
            status: true,
            message:
              "Please ensure you provide all required fields for region: " +
              msg,
          });
      }

      const vpn = await vpnModel.create({
        country: country,
        countryCode: code,
        countryImage: image,
        unicode: unicode,
        regions: regions,
      });

      if (!vpn) {
        return res
          .status(400)
          .json({ data: [], status: false, message: "Unable to create vpn" });
      }
      return res
        .status(200)
        .json({
          data: vpn,
          status: true,
          message: "Your vpn and regions has been created successfully",
        });
    }

    return res
      .status(400)
      .json({
        data: [],
        status: true,
        message: "Please provide valid regions",
      });
  } catch (error) {
    return failedResponseHandler(error, res);
  }
};

exports.createMultipleVpn = async (req, res) => {
  const { countries } = req.body;

  try {

    if(countries && Array.isArray(countries)){

      var added = 0, notAdded  = 0;

      
      for(i = 0; i < countries.length; i++){

            const { unicode, code, image, name} = countries[i];
            const regions = []
            // countries[i].regions == null? []:countries[i].regions;

        if (!name || !code || !image) {
            const msg =
            (!name ? "Country name, " : "") +
            (!code ? "Country code, " : "") +
            (!image ? "Image, " : "");
          return res
            .status(400)
            .json({
              data: [],
              status: false,
              message: "Please provide required fields: " + msg,
            });
        }

  

        //validate regions
        if (regions != null && Array.isArray(regions)) {
          let msg = null;

          for (i = 0; i < regions.length; i++) {
              const region = regions[i];
            if (
              !region.regionName ||
              !region.ipAddress ||
              !region.port ||
              !region.filePath ||
              !region.slug ||
              !region.password
            ) {
              msg =
                (!region.regionName ? "Region Name, " : "") +
                  (!region.ipAddress ? "Ip Address" : "") ||
                (!region.port ? "Port, " : "") ||
                (!region.filePath ? "File path" : "") ||
                (!region.slug ? "Slug" : "");
              break;
            }
          }

          if (msg != null) {
            return res
              .status(201)
              .json({
                data: [],
                status: true,
                message:
                  "Please ensure you provide all required fields for region: " +
                  msg,
              });
          }

          const vpn = await vpnModel.create({
            country: name,
            countryCode: code,
            unicode: unicode,
            countryImage: image,
            regions: [],
          });

          if (!vpn) {
            notAdded++
          }else{
            added++
          }
          
          
        }
        
      }

      return res
          .status(200)
          .json({
            data: [],
            status: true,
            message: `Your vpn and regions has been created successfully with ${added} added and ${notAdded} not added`,
          });

    }
    
    return res
      .status(400)
      .json({
        data: vpn,
        status: true,
        message: "Please provide country list",
      });
  } catch (error) {
    return failedResponseHandler(error, res);
  }
};



exports.getAllVpn = async (req, res) => {
  try {
    const vpns = await vpnModel.find({regions: { $gt:{$size:1}}});

    if (!vpns) {
      return res
        .status(400)
        .json({
          data: [],
          status: false,
          message: "VPN has not been added to the list yet.",
        });
    }
    return res
      .status(200)
      .json({
        data: vpns,
        status: true,
        message: "VPN data listed completely",
      });
  } catch (error) {
    return failedResponseHandler(error, res);
  }
};

exports.getAll = async (req, res) => {
  try {
    const vpns = await vpnModel.find();

    if (!vpns) {
      return res
        .status(400)
        .json({
          data: [],
          status: false,
          message: "VPN has not been added to the list yet.",
        });
    }
    return res
      .status(200)
      .json({
        data: vpns,
        status: true,
        message: "VPN data listed completely",
      });
  } catch (error) {
    return failedResponseHandler(error, res);
  }
};


exports.getVpnById = async (req, res) =>{
  try{
    const {id }= req.params;

    const findVpn = await vpnModel.findOne({_id:id});
    if(!findVpn){
        return res.status(400).json({data:[],status:false,message:"Unable to get vpn of provided ID"});
    }

    
    return res.status(200).json({data:{...findVpn.toObject()},status:true,message:"VPN found"});

  }catch(error){
    return failedResponseHandler(error,res)
  }
}

exports.getRegionByQuery = async (req, res) =>{
  try{  
  const {cc,rn }= req.params;

    const findVpn = await vpnModel.findOne({countryCode:cc.toUpperCase()});
    if(!findVpn){
        return res.status(400).json({data:[],status:false,message:"Unable to get vpn of provided ID"});
    }
    const region = findVpn.regions.find((rg)=> rg.regionName.toLowerCase() == rn.toLowerCase() || rg.slug.toLowerCase() == rn.toLowerCase() || rg._id == rn);
    if(!region){
      return res.status(400).json({data:[],status:false,message:"Unable to get region with provide query"});
    }
    //get a .ovpn file, load it as bytes[]
  const filePath = path.join(__dirname,_path,path.basename(region.filePath));

  //load to memory
  let file = fs.readFileSync(filePath).toString("utf-8"); 

    return res.status(200).json({data:{...region,country:findVpn.country,countryCode:findVpn.countryCode, countryImage:findVpn.countryImage,content:Buffer.from(file).toString('base64')},status:true,message:"Region Found"});

  }catch(error){
    return failedResponseHandler(error,res)
  }
}

exports.updateRegion = async (req, res) =>{
  try{  
  const {cc,findBy, regionName,port,ipAddress,filePath, slug }= req.body;

    const findVpn = await vpnModel.findOne({countryCode:cc.toUpperCase()});
    if(!findVpn){
        return res.status(400).json({data:[],status:false,message:"Unable to get vpn of provided country code"});
    }
    let regionIndex = 0;
    const region = findVpn.regions.find((rg,index)=>{
      regionIndex = index;
    return rg.regionName.toLowerCase() == findBy.toLowerCase() || rg.slug.toLowerCase() == findBy.toLowerCase() || rg._id == findBy
    });
    if(!region){
      return res.status(400).json({data:[],status:false,message:"Unable to identify specified region"});
    }
    //update region
    if(regionName){
      region.regionName = regionName
    }
    if(port){
      region.port = port
    }
    if(ipAddress){
      region.ipAddress = ipAddress
    }
    if(filePath){
      region.filePath = filePath
    }
    if(slug){
      region.slug = slug
    }

    findVpn.regions[regionIndex] = region;
    await findVpn.save();
    


    return res.status(200).json({data:{...region.toObject(),country:findVpn.country,countryCode:findVpn.countryCode, countryImage:findVpn.countryImage},status:true,message:"Region Found"});

  }catch(error){
    return failedResponseHandler(error,res)
  }
}

exports.addSingleRegion = async (req, res) =>{
  try{  
  const {cc,findBy, region }= req.body;

    const findVpn = await vpnModel.findOne({countryCode:cc.toUpperCase()});
    if(!findVpn){
        return res.status(400).json({data:[],status:false,message:"Unable to get vpn of provided country code"});
    }

    if(!region.regionName || !region.port || !region.ipAddress || !region.filePath || !region.slug ){
      const msg = (!region.regionName?'Region name, ':'') || (!region.port?'port, ':'') || (!region.ipAddress?'ipAddress, ':'') || (!region.filePath?'file, ':'') || !region.slug
      return res.status(400).json({data:[],status:false,message:"Please ensure regions have required properties: "+ msg});
    }
    let rIndex = 0;
    //check if region already exist
    if(!findVpn.regions.find((reg,i)=>{
      rIndex = i
      reg.slug == region.slug
    })){
      findVpn.regions.push(region);
    }else{
      findVpn.regions[rIndex] = region;
    }

    await findVpn.save();  
    
    return res.status(200).json({data:{...region,country:findVpn.country,countryCode:findVpn.countryCode, countryImage:findVpn.countryImage},status:true,message:"Region Found"});

  }catch(error){
    return failedResponseHandler(error,res)
  }
}


exports.addRegions = async (req, res) =>{
  try{  
  const {cc, regions }= req.body;

    const findVpn = await vpnModel.findOne({countryCode:cc.toUpperCase()});
    if(!findVpn){
        return res.status(400).json({data:[],status:false,message:"Unable to get vpn of provided country code"});
    }
    if(regions && Array.isArray(regions)){
      
      for(i = 0;i < regions.length; i++){
        const region = regions[i];

        if(!region.regionName || !region.port || !region.ipAddress || !region.filePath || !region.slug ){
          const msg = (!region.regionName?'Region name, ':'') || (!region.port?'port, ':'') || (!region.ipAddress?'ipAddress, ':'') || (!region.filePath?'file, ':'') || !region.slug
          return res.status(400).json({data:[],status:false,message:"Please ensure regions have required properties: "+ msg});
        }
        
        findVpn.regions[i] = region;
      }
      await findVpn.save();
      return res.status(200).json({data:{...findVpn.toObject()},status:true,message:"VPN server regions added"});
    }
    
    return res.status(400).json({data:[],status:true,message:"VPN server found"});

  }catch(error){
    return failedResponseHandler(error,res)
  }
}


exports.getVpnByQuery = async (req, res) =>{
  try{  
  const {country, code,  }= req.query;

    let findVpn;
    if(country){
     findVpn = await vpnModel.findOne({countryName:country});    
    }else if(code){
        findVpn = await vpnModel.findOne({countryCode:code});    
    }
    else{
        return res.status(400).json({data:[],status:false,message:"You have not provided any query parameter"});
    }

    if(!findVpn){
        return res.status(400).json({data:[],status:false,message:"Unable to get vpn of provided query"});
    }

    return res.status(200).json({data:{...findVpn.toObject()},status:true,message:"VPN found"});
  }catch(error){
    return failedResponseHandler(error,res)
  }

}

exports.updateVpn = async (req, res) =>{

  try{
    const {country,code,image,regions, id} = req.params;

    if(!id){
        return res
      .status(400)
      .json({
        data: [],
        status: false,
        message: "Please provide vpn id",
      });
    }

    const vp = await vpModel.findOne({_id:id});

    if(!vp){
        return res
        .status(400)
        .json({
          data: [],
          status: false,
          message: "VPN ID does not exist",
        });
      }

      if(country){
          vp.country = country;
      }
      if(code){
          vp.countryCode = code;
      }
      if(image){
          vp.countryImage = image;
      }
      if(regions != null && Array.isArray(regions)){
          vpn.regions = regions;
      }

      const saved = await vpn.save();
      if(!saved){
        return res
        .status(400)
        .json({
          data: [],
          status: false,
          message: "Unable to save VPN",
        });   
      }

      return res
      .status(200)
      .json({
        data: saved,
        status: true,
        message: "VPN updated successfully",
      });
    } catch (error) {
      return failedResponseHandler(error, res);
    }

    }


exports.deleteVpn = async (req, res) => {
    
  try{
    const {id} = req.param
  
    const deleted = await vpnModel.deleteOne({_id:id});
    if(deleted){
    return res
      .status(200)
      .json({
        data: deleted,
        status: true,
        message: "VPN cleared from documents",
      });
    }
  
  return res
    .status(400)
    .json({
      data: [],
      status: false,
      message: "Unable to delete vpn",
    });
  } catch (error) {
    return failedResponseHandler(error, res);
  }
};

exports.deleteAllVpn = async (req, res) => {
  try{
  const { deleteAccess } = req.body;
  if (deleteAccess == "damilola") {
    const deleted = await vpnModel.deleteMany({});
    return res
      .status(200)
      .json({
        data: deleted,
        status: true,
        message: "VPN cleared from documents",
      });
  }
  return res
    .status(400)
    .json({
      data: [],
      status: false,
      message: "You do no have access to delete all",
    });
  } catch (error) {
    return failedResponseHandler(error, res);
  }
};





const getIpAddressAndPort = (file)=>{
const regex = /remote\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+)/;
const matches = file.match(regex);
return {ipAddress: matches[1], port:matches[2]};
}
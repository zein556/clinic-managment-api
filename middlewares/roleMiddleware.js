module.exports=(allowedroles)=>{
    return(req,res,next)=>{
        if(!req.user||!req.user.role){
            return res.status(403).json({error:"Access denied, user role not found"});
        }
        if(!allowedroles.includes(req.user.role)){
            return res.status(403).json({error:"Access denied,you dont have permission to access this resource"});
        }
        next();
    };
};
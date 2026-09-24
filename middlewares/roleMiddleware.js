const checkRole=(allowedroles)=>{
    return(req,res,next)=>{
        if(!req.user||!req.user.role){
            return res.status(403).json({error:"Access denied, user role not found"});
        }
       const normalizedAllowed=allowedroles.map(r=>r.toLowerCase());
       const userRole=req.user.role.toLowerCase();
        if(!normalizedAllowed.includes(userRole)){
            return res.status(403).json({error:"Access denied,you dont have permission to access this resource"});
        }
        next();
    };
};
module.exports= checkRole;
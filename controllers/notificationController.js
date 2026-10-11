const notificationModel=require('../models/NotificationModel');
const getNotifications=async(req,res,next)=>{
    try{
        const userId=req.user.id;
        const notifications =await notificationModel.findNotificationsByUserId(userId);
      if(notifications.length===0){
        return res.status(200).json({message:"No notifications found",notifications:[]});
      }
      
        return res.status(200).json({notifications});
    }catch(err){
        next(err);
    }
}
const getUnreadNotifications=async(req,res,next)=>{
    try{
        const userId=req.user.id;
        const notifications =await notificationModel.findUnreadNotificationsByUserId(userId);
       if(notifications.length===0){
        return res.status(200).json({message:"No unread notifications found",notifications:[]});
       }
       
        return res.status(200).json({notifications});
    }catch(err){
        next(err);
    }
}
const markNotificationAsRead=async(req,res,next)=>{
    try{
        const {id}=req.params;
        const userId=req.user.id;
        const notification=await notificationModel.findNotificationById(id);
        if(!notification){
            return res.status(404).json({error:"Notification not found"});
        }
        if(notification.user_id!==userId){
            return res.status(403).json({error:"Access denied.You cannot mark this notification as read"});
        }
        const updatedNotification=await notificationModel.markNotificationAsRead(id);
        return res.status(200).json({message:"Notification marked as read",notification:updatedNotification});
    }catch(err){
        next(err);
    }
}
    const markallNotificationsAsRead=async(req,res,next)=>{
        try{
            const userId=req.user.id;
            await notificationModel.markAllNotificationsAsRead(userId);
            return res.status(200).json({message:"All notifications marked as read"});
        }catch(err){
            next(err);
        }
    }
    module.exports={
        getNotifications,
        getUnreadNotifications,
        markNotificationAsRead,
        markallNotificationsAsRead
    }

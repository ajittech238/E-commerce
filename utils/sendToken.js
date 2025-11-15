export const sendToken = (data, code, message, req, res)=>{
    const token = data.generateToken()
    const isLocalhost = req.headers.origin && req.headers.origin.includes("localhost");

    const user = {
        id : data._id,
        userName : data.userName,
        email : data.email,
        role : data.role
    }
    res.status(code).cookie("token", token,{
        expires : new Date(Date.now() + process.env.COOKIE_EXPIRE*24*60*60*1000),
        httpOnly : false,
        secure: !isLocalhost,  
        sameSite: isLocalhost ? "Lax" : "None", 
    }).json({
        success : true,
        user,
        message,
        token
    })
}
import { user } from "../model/userModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"
import bcrypt from 'bcrypt'

export const updateEmployee = async(req, res, next)=>{
    try {
    const eId  = req.params.id

        const {
    userName , 
    email ,
    password ,
    role ,
    phoneNumber ,
    address ,
    dateOfBirth ,
    gender ,
    maritalStatus ,
    employeeId ,
    nationality ,
    emergencyContactName ,
    emergencyContactNumber ,
    department ,
    designation ,
    dateOfJoined ,
    contractType ,
    salary , 
    bankAccount ,
    taxId ,
    // photo
    // resume
    
        } = req.body

    if(
    !userName && 
    !email && 
    !password &&
    !role && 
    !phoneNumber && 
    !address && 
    !dateOfBirth && 
    !gender && 
    !maritalStatus && 
    !employeeId && 
    !nationality && 
    !emergencyContactName && 
    !emergencyContactNumber && 
    !department && 
    !designation && 
    !dateOfJoined && 
    !contractType && 
    !salary  && 
    !bankAccount && 
    !taxId ){
        return next(new ErrorHandler("please fill atleast one the field", 400))
    }

    let data = await user.findOne({_id : eId})

        return next(new ErrorHandler("invaild employeeId", 400))
    
    if(userName){
        data.userName = userName 
    }
    if(email){
        data.email = email 
    }
if(password){
    const hashPassword = await bcrypt.hash(password, 10)
    data.password = hashPassword
    }
if(role){ 
    data.role = role 
    }
if(phoneNumber){     
    data.phoneNumber = phoneNumber 
}
if(address){
    data.address = address 
    }
if(dateOfBirth){     
    data.dateOfBirth = dateOfBirth 
    }
if(gender){  
    data.gender = gender
    }
if(maritalStatus){ 
    data.maritalStatus =  maritalStatus
    }
if(employeeId){  
    data.employeeId =  employeeId 
    }
if(nationality){  
    data.nationality = nationality 
    }
if(emergencyContactName){   
    data.emergencyContactName = emergencyContactName 
    }
if(emergencyContactNumber){  
    data.emergencyContactNumber = emergencyContactNumber 
    }
if(department){ 
    data.department = department 
    }
if(designation){    
    data.designation = designation 
    }
if(dateOfJoined){
    data.dateOfJoined = dateOfJoined 
    }
if(contractType){
    data.contractType = contractType 
    }
if(salary){ 
    data.salary = salary 
    }
if(bankAccount){
    data.bankAccount = bankAccount 
    }
if(taxId){ 
    data.taxId = taxId 
    }
  

    await data.save()

    res.status(200).json({
        success : true,
        message : "employee updated Successfully !",
        newEmployee : data
    })

    }catch (err) {
        console.error(err)
        return next(new ErrorHandler("failed to update employee", 500))
    }
}

export const getEmployee = async(req, res, next)=>{
    try {
        const data = await user.find({role : "employee"})
            return next(new ErrorHandler("no employee found !", 200))

        res.status(200).json({
            success : true,
            results : data.length,
            data
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("failed to fetch employee data", 500))
    }
}


export const getOneEmployee = async(req, res, next)=>{
    try {
        const eId = req.params.id
        const data = await user.findOne({
           
                _id : eId
            
            }
            )
            // console.log(data)
            return next(new ErrorHandler("employee id is invaild !", 400))

        res.status(200).json({
            success : true,
            data
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("failed to fetch employee data", 500))
    }
}


export const addEmployee = async(req, res, next)=>{
    try {
        const {
    userName , 
    email ,
    password ,
    role ,
    phoneNumber ,
    address ,
    dateOfBirth ,
    gender ,
    maritalStatus ,
    employeeId ,
    nationality ,
    emergencyContactName ,
    emergencyContactNumber ,
    department ,
    designation ,
    dateOfJoined ,
    contractType ,
    salary , 
    bankAccount ,
    taxId ,
    // photo
    // resume
    
        } = req.body

    if(
    !userName || 
    !email || 
    !password || 
    !role || 
    !phoneNumber || 
    !address || 
    !dateOfBirth || 
    !gender || 
    !maritalStatus || 
    !employeeId || 
    !nationality || 
    !emergencyContactName || 
    !emergencyContactNumber || 
    !department || 
    !designation || 
    !dateOfJoined || 
    !contractType || 
    !salary  || 
    !bankAccount || 
    !taxId ){
        return next(new ErrorHandler("please fill all the field", 400))
    }

    let data = await user.findOne({employeeId})

    if(data){
        return next(new ErrorHandler("employee already exists", 200))
    }

    const hashPassword = await bcrypt.hash(password, 10)

    data = await user.create({
    userName , 
    email ,
    password : hashPassword ,
    role ,
    phoneNumber ,
    address ,
    dateOfBirth ,
    gender ,
    maritalStatus ,
    employeeId ,
    nationality ,
    emergencyContactName ,
    emergencyContactNumber ,
    department ,
    designation ,
    dateOfJoined ,
    contractType ,
    salary , 
    bankAccount ,
    taxId 
    })

    await data.save()

    res.status(200).json({
        success : true,
        message : "employee added Successfully !",
        newEmployee : data
    })

    }catch (err) {
        console.error(err)
        return next(new ErrorHandler("failed to add employee", 500))
    }
}

export const disableEmployee = async(req, res, next)=>{
    try {
        const eId = req.params.id;

        const data = await user.findOne({_id : eId})

            return next(new ErrorHandler("invaild employeeId !", 400))

        data.isdisable = !data.isdisable
        await data.save()
        res.status(200).json({
            success : true,
            message : `employee id ${data.isdisable ? "disabled" : "enabled"}`
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("something went wrong", 500))
    }
}
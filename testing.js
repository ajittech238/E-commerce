import { randomreward } from "./controller/scratchCardController.js"
import { invoice } from "./model/invoiceModel.js"


export const datemodify = async()=>{
    try {
        const orderId = "68a2b9cb0f0c2aba5df736e5"
        const data = await invoice.findOne({orderId})
        let date = data.orderDate.toISOString().slice(0,10).replaceAll("-", "/")
        console.log(date)
    } catch (err) {
        console.error(err)
    }
}

export const linkCreate = async()=>{
    try {
        const userId = "689c3ffab78ad54300124100"
        const data = new Date(Date.now())
        const dateString = data.toLocaleString().replaceAll("/","").replaceAll(",","").replaceAll(" ", "").replaceAll(":", "").slice(0,13)
        const dateString2 = data.toLocaleString().replace(/[-:/T,AM ]/g, "")
        console.log(dateString)
        console.log(dateString2)
        console.log(data)

        const userString = userId.slice(0,9)
        const link = userString + dateString
        console.log(link)
      
    } catch (err) {
        console.error(err)
    }
}

export const getreward = async()=>{
      try {
             const reward = await randomreward() 
     
             console.log(reward) 
      
       
    //    console.log(selectreward)          
      
    } catch (err) {
        console.error(err)
    }
}

//jshint esversion:6

exports.getDate=()=>{
const today = new Date();
    
   const options ={
    weekday: "long",
    day: "numeric",
    month: "long"
   }

   let day =today.toLocaleDateString("en-US",options);
   return day
}

exports.getDay=()=>{
    const today = new Date();
        
       const options ={
        weekday: "long"
       }
    
       let day =today.toLocaleDateString("en-US",options);
       return day
    }


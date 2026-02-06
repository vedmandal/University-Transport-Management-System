import mongoose from "mongoose"


const ConnectDb=async()=>{
    try {

       await mongoose.connect(process.env.MONGO_DB,{ family: 4});

        console.log(` mongoDB connected  ${mongoose.connection.host}`)

        
    } catch (error) {
        console.log(`mongoDB connection failed`,error.message);
        process.exit(1);
    }
}

export default ConnectDb
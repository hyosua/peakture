import mongoose from 'mongoose'


const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.ATLAS_URI)
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } catch (err) {
        console.error(`Error connecting to Mongodb: ${err}`);
        process.exit(1)
    }
}


export default connectMongoDB;

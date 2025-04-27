const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'peakture-preset')

    try {
        const response = await fetch("https://api.cloudinary.com/v1_1/djsj0pfm3/image/upload", {
            method: "POST",
            body: formData
        })

        const data = await response.json()
        return data.secure_url
    } catch (error){
        console.error("Error uploading to Cloudinary: ",error)
        throw error
    }
}

export default uploadToCloudinary
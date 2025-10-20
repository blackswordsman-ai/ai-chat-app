const fs =require('fs').promises;

const deleteFile =async(filePath) => {
    try{
   await fs.unlink(filePath)
   console.log("file deleted successfully");
   
    } catch(error){
        console.error("Error deleting file:",error);
    }
}

module.exports = {
    deleteFile
};
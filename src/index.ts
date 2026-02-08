import express from 'express'
import ffmpeg from 'fluent-ffmpeg';
import { setUpDirectories, convertVideo, downloadRawVideo, uploadProcessedVideo, deleteRawVideo, deleteProcessedVideo } from './storage';

const app = express()
setUpDirectories() // to ensure that the file directory exists

app.use(express.json())
const port = 3000

app.post('/process-video', async (req,res) => {
    // Get the bucket and filename from the Cloud Pub/Sub message
  let data;
  try {
    const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error('Invalid message payload received.');
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send('Bad Request: missing filename.');
  }

  //input file name
  const inputFileName= data.name
  const outputFileName = `processed-${inputFileName}`

  //download the video from bucket
  await downloadRawVideo(inputFileName)

  //convert the video
  try {
    await convertVideo(inputFileName,outputFileName)
    
  } catch (error) {
    console.error(error)
    await deleteRawVideo(inputFileName)
    await deleteProcessedVideo(outputFileName)
    return res.status(500).send('internal server error 500')
  }

  //upload back to storage
  await uploadProcessedVideo(outputFileName)

  //delete the file in local folder
  await deleteRawVideo(inputFileName)
  await deleteProcessedVideo(outputFileName)

  




 

})


app.listen(port, ()=> {
    console.log(`app is listening on port: ${port}`)
})
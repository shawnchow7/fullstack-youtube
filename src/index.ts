import express from 'express'
import ffmpeg from 'fluent-ffmpeg';

const app = express()

app.use(express.json())
const port = 3000

app.post('/process-video', (request,response) => {

    //first thing is to get the input file path & output file path for the videos
    const inputFilePath = request.body.inputfilepath
    const outputFilePath = request.body.outputfilepath

    //just to make sure that there is request body actually have those fields
    if(!inputFilePath || !outputFilePath){
        return response.status(500).send('Bad request: invalid file path')
    }

    // Create the ffmpeg command
    ffmpeg(inputFilePath)
        .outputOptions('-vf', 'scale=-1:360') // 360p
        .on('end', function() {
            console.log('Processing finished successfully');
            response.status(200).send('Processing finished successfully');
        })
        .on('error', function(err: any) {
            console.log('An error occurred: ' + err.message);
            response.status(500).send('An error occurred: ' + err.message);
        })
        .save(outputFilePath);

})


app.listen(port, ()=> {
    console.log(`app is listening on port: ${port}`)
})
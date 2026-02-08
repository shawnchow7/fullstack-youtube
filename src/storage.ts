import { Storage } from "@google-cloud/storage";
import fs from 'fs/promises';
import ffmpeg from "fluent-ffmpeg";

// declaring an instance of google cloud storage to interact with it
const storage = new Storage();


const rawVideoBucket = 'scwj-raw-video-bucket'
const processedVideoBucket = 'scwk-processed-video-bucket'

const localRawVideoPath = './raw-vidoes'
const localProcessedVideoPath = './processed-video' 


//need a function that creates local file directory for raw and processed video
export function setUpDirectories(){
    ensureDirectoryExists(localRawVideoPath)
    ensureDirectoryExists(localProcessedVideoPath)
}


// need a function to convert the video, assumes that the videos to be processed are already in the local folder
export function convertVideo(rawVideoName: string, processedVideoName: string): Promise<void>{
    return new Promise<void>((resolve,reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
            .outputOptions('-vf', 'scale=-1:360')
            .on('end', function() {
                console.log('Processing finished successfully');
                resolve() // will return the promise as success, will just signal am done, but the promise does not need to have a value
            })
            .on('error', function(err: any) {
                console.log('An error occurred: ' + err.message);
                reject(err  ) // will return the promise as rejected
            })
            .save(`${localProcessedVideoPath}/${processedVideoName}`);
    })
}


// need a function to download the raw videos from google cloud storage
export async function downloadRawVideo(rawVideoName: string){
    await storage.bucket(rawVideoBucket).file(rawVideoName)
        .download({destination: `${localRawVideoPath}/${rawVideoName}`})

    console.log(`gs://${rawVideoBucket}/${rawVideoName} downloaded to ${localRawVideoPath}/${rawVideoName}.`)
}

// need a function to upload processed video to google cloud storage
export async function uploadProcessedVideo(processedVideoName: string){
    await storage.bucket(processedVideoBucket).upload(`${localProcessedVideoPath}/${processedVideoName}`, {destination: processedVideoName})

    console.log(`${localProcessedVideoPath}/${processedVideoName} uploaded to ${processedVideoBucket} bucket`)

    await storage.bucket(processedVideoBucket).file(processedVideoName).makePublic()  
}


async function deleteFile(filepath: string){
    try {
        await fs.unlink(filepath)
        console.log(`file deleted at path ${filepath}`)
        
    } catch (err) {
        if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
            console.log('File does not exist, skipping deletion.');
        } else {
            console.error('Error deleting file:', err);
            throw err;
        }
    }
        
}

export function deleteRawVideo(filename: string){
    return deleteFile(`${localRawVideoPath}/${filename}`) 
}

export function deleteProcessedVideo(filename: string){
    return deleteFile(`${localProcessedVideoPath}/${filename}`)  
}

async function ensureDirectoryExists(dirpath: string) {
    try {
        await fs.mkdir(dirpath, { recursive: true });
        console.log(`Directory ensured: ${dirpath}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error ensuring directory ${dirpath}:`, errorMessage);
        throw error; // Re-throw if you want calling code to handle it
    }
}
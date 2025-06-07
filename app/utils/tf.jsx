import * as tf from "@tensorflow/tfjs";
import { decodeJpeg,bundleResourceIO} from "@tensorflow/tfjs-react-native";
import * as FileSystem from "expo-file-system";
//import AsyncStorage from "@react-native-async-storage/async-storage";


//const modelJson = "https://cdn.jsdelivr.net/gh/kichu12348/new_kids@main/assets/tfjs_model/model.json";
const modelJson= bundleResourceIO(
    require("../../assets/tfjs_model/model.json"),
    [
        require("../../assets/tfjs_model/group1-shard1of3.bin"),
        require("../../assets/tfjs_model/group1-shard2of3.bin"),
        require("../../assets/tfjs_model/group1-shard3of3.bin"),
    ]
)

async function loadModel(progressCallback=()=>{}) {
  try {
    await tf.ready();
   // console.log(tf.version.tfjs)
    const model = await tf.loadGraphModel(modelJson,{
        onProgress:progressCallback
    });
    return model;
  } catch (error) {
    console.error("Error loading model:", error);
    throw error;
  }
}

async function transformImageToTensor(uri) {
  const img64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const imgBuffer = tf.util.encodeString(img64, "base64").buffer;
  const raw = new Uint8Array(imgBuffer);
  let imgTensor = decodeJpeg(raw);
  const scalar = tf.scalar(255);

  imgTensor = tf.image.resizeNearestNeighbor(imgTensor, [256, 256]);
  const tensorScaled = imgTensor.div(scalar);

  const img = tf.reshape(tensorScaled, [1, 256, 256, 3]);
  return img;
}


async function predict(batch, model, imageTensor) {
  if (!model) {
    throw new Error("Model is not loaded");
  }
  const prediction = model.predict(imageTensor);
  const pred = prediction.dataSync();
  prediction.dispose();
  return pred;
}

async function getPrediction(uri, model) {
  try {
    const imageTensor = await transformImageToTensor(uri);
    const prediction = await predict(1, model, imageTensor);

    tf.dispose(imageTensor);

    return prediction;
  } catch (error) {
    console.error("Error in prediction:", error);
    throw error;
  }
}

export { loadModel, getPrediction};
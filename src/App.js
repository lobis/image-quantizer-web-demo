import React, {useCallback, useEffect, useRef, useState} from "react"

import "./App.css";

import ReactCrop from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

import CryptoJS from "crypto-js"

const App = () => {

    const [referenceWidth, referenceHeight] = [600, 448]

    const [image, setImage] = useState(null)
    const [imageName, setImageName] = useState("")
    const [imageHash, setImageHash] = useState("")

    const [cropImageBase64, setCropImageBase64] = useState("")
    const [responseImageBase64, setResponseImageBase64] = useState("")

    const imageRef = useRef(null)
    const previewCropCanvasRef = useRef(null)
    const responseQuantizedCanvasRef = useRef(null)
    const inputRef = useRef(null)

    const onImageLoad = useCallback((img) => {
        imageRef.current = img
    }, [])

    const [crop, setCrop] = useState({unit: "%", width: 100, aspect: referenceWidth / referenceHeight})
    const [completedCrop, setCompletedCrop] = useState(null)

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            // probably there is a better way to do this
            {
                const reader = new FileReader()
                reader.addEventListener("load", () => setImage(reader.result))
                const file = e.target.files[0]
                reader.readAsDataURL(file)
                setImageName(file.name)
            }
            {
                const reader = new FileReader()
                // https://stackoverflow.com/questions/28437181/md5-hash-of-a-file-using-javascript
                reader.addEventListener("load", () => {
                    const wordArray = CryptoJS.lib.WordArray.create(reader.result)
                    setImageHash(CryptoJS.MD5(wordArray).toString())
                })

                reader.readAsArrayBuffer(e.target.files[0])
            }
        }
    }

    const submitImage = () => {
        fetch("http://127.0.0.1:5000" + "/quantize", {
            method: "POST", body: JSON.stringify({
                name: imageName, hash: imageHash, image: cropImageBase64
            }), headers: {
                "Content-type": "application/json; charset=UTF-8", // "Access-Control-Allow-Origin": "*"
            }
        }).then(response => response.json())
            .then(json => {
                const quantizedImage = json["quantized"];
                const name = json["name"]
                setResponseImageBase64(quantizedImage)
                console.log("received quantized image ", name)
            })
            .catch(err => console.log(err))

    }


    useEffect(() => {
        if (!completedCrop || !previewCropCanvasRef.current || !imageRef.current) {
            return
        }

        const image = imageRef.current
        const canvas = previewCropCanvasRef.current
        const crop = completedCrop

        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height
        const ctx = canvas.getContext("2d")
        const pixelRatio = window.devicePixelRatio

        canvas.width = crop.width * pixelRatio * scaleX
        canvas.height = crop.height * pixelRatio * scaleY

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
        ctx.imageSmoothingQuality = "high"

        ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width * scaleX, crop.height * scaleY)

        setCropImageBase64(canvas.toDataURL("image/png"))

    }, [completedCrop])

    useEffect(() => {
        console.log("updating response image")
        if (!responseImageBase64 || !responseQuantizedCanvasRef.current) {
            return
        }

        const canvas = responseQuantizedCanvasRef.current

        canvas.width = previewCropCanvasRef.current.width
        canvas.height = previewCropCanvasRef.current.height

        const ctx = canvas.getContext("2d")

        const image = new Image()
        image.onload = () => {
            ctx.drawImage(image, 0, 0)
        }
        image.src = responseImageBase64

    }, [responseImageBase64])

    return (<div className="App">
            <header className="App-header">

                <div>
                    <input type="file" accept="image/*" onChange={onSelectFile}
                           ref={inputRef}/>
                </div>

                <ReactCrop
                    keepSelection={true}
                    src={image}
                    onImageLoaded={onImageLoad}
                    crop={crop}
                    onChange={(c) => {
                        setCrop(c)
                    }}
                    onComplete={(c) => {
                        setCompletedCrop(c)
                    }}
                    style={{
                        // maxWidth: referenceWidth,
                        maxWidth: "50%"
                    }}
                />


                <button className="button-submit"
                        type="button"
                        disabled={!completedCrop?.width || !completedCrop?.height}
                        onClick={submitImage}
                >
                    Submit
                </button>

                <div className="out-container">
                    <div className="out-image">
                        <p>
                            Crop Preview
                        </p>
                        <canvas ref={previewCropCanvasRef}
                                style={{
                                    width: "100%"
                                    // width: referenceWidth,
                                    // height: referenceHeight
                                }}
                        />
                    </div>

                    <div className="out-image">
                        <p>
                            Response Preview
                        </p>
                        <canvas ref={responseQuantizedCanvasRef}
                                style={{
                                    width: "100%"
                                }}
                        />
                    </div>
                </div>
            </header>
        </div>
    )
}

export default App
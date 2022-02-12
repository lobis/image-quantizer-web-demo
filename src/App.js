import React, {useState, useCallback, useRef, useEffect} from "react"

import "./App.css";

import ReactCrop from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

import CryptoJS from "crypto-js"


const App = () => {

    const [referenceWidth, referenceHeight] = [600, 448]

    const [image, setImage] = useState(null)
    const [imageName, setImageName] = useState(null)
    const [imageHash, setImageHash] = useState(null)

    const imageRef = useRef(null)
    const previewCropCanvasRef = useRef(null)
    const inputRef = useRef(null)

    const onImageLoad = useCallback((img) => {
        imageRef.current = img
    }, [])

    const [crop, setCrop] = useState({unit: "%", width: 100, aspect: referenceWidth / referenceHeight})
    const [completedCrop, setCompletedCrop] = useState(null)

    const onSelectFile = (e) => {
        console.log("FILE SELECTED!")
        if (e.target.files && e.target.files.length > 0) {
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
                reader.addEventListener(
                    "load",
                    () => {
                        const wordArray = CryptoJS.lib.WordArray.create(reader.result)
                        setImageHash(CryptoJS.MD5(wordArray).toString())
                    }
                )

                reader.readAsArrayBuffer(e.target.files[0])
            }
        }
    }

    useEffect(() => {
        if (!inputRef.current) {
            return
        }
        const input = inputRef.current
        console.log(input)
        // input.
    }, [inputRef])

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

        /*
        const cropPositionRelLeft = crop.x / (image.naturalWidth / scaleX)
        const cropPositionRelRight = cropPositionRelLeft + crop.width / (image.naturalWidth / scaleX)
        const cropPositionRelTop = crop.y / (image.naturalHeight / scaleY)
        const cropPositionRelBottom = cropPositionRelTop + crop.height / (image.naturalHeight / scaleY)

        console.log(cropPositionRelLeft, cropPositionRelRight)
        console.log(cropPositionRelTop, cropPositionRelBottom)
        */

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
        ctx.imageSmoothingQuality = "high"

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY
        )

        // setCropImageBase64(canvas.toDataURL("image/png"))

    }, [completedCrop])

    return (
        <div className="App">
            <header className="App-header">
                <p>
                    {imageHash}
                </p>

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
                        maxWidth: "40%"
                    }}
                />

                <div>
                    <p>
                        Crop Preview
                    </p>
                    <canvas className="crop-image"
                            ref={previewCropCanvasRef}
                            style={{
                                width: "40%"
                                // width: referenceWidth,
                                // height: referenceHeight
                            }}
                    />
                </div>

            </header>
        </div>
    )
}

export default App
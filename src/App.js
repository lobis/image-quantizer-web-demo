import "./App.css";
import ReactCrop from "react-image-crop"
import CryptoJS from "crypto-js"


const App = () => {

  const [image, setImage] = useState()
  const [imageHash, setImageHash] = useState()

  const imgRef = useRef(null)

  const onSelectFile = (e) => {
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
            setImageHashMD5(CryptoJS.MD5(wordArray).toString())
          }
        )

        reader.readAsArrayBuffer(e.target.files[0])
      }
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Adios
        </p>

        <div>
          <input type="file" accept="image/*" onChange={onSelectFile} />
        </div>

      </header>
    </div>
  )
}

export default App
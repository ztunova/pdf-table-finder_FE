import { useState } from 'react'
import './App.css'
import PdfViewer from './components/PdfViewer'
import FileUploader from './components/FileUploader'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <FileUploader />
    </>
  )
}

export default App

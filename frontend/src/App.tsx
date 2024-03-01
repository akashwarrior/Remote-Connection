import { Link } from 'react-router-dom'
import './App.css'

function App() {

  return (
    <div className="landing_btn">
      <button ><Link to="/shareScreen">Share Screen</Link></button>
      <button><Link to="/accessScreen">Access Screen</Link></button>
    </div>
  )
}

export default App

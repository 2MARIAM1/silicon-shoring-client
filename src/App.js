import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import UploadScreen from "./screens/UploadScreen";
import ChatAssistant from "./screens/ChatAssistant";
import 'bootstrap/dist/css/bootstrap.min.css';



function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
              <UploadScreen />
          }/>
            <Route path="/chat-assistant" element={
                <ChatAssistant/>
            }/>

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

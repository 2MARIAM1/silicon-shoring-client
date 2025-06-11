import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import ChatAssistant from "./screens/ChatAssistant";
import LoginPage from "./screens/LoginPage";
import ProtectedRoute from "./screens/ProtectedRoute";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    {/*<Route*/}
                    {/*    path="/"*/}
                    {/*    element={*/}
                    {/*        <ProtectedRoute>*/}
                    {/*            <UploadScreen />*/}
                    {/*        </ProtectedRoute>*/}
                    {/*    }*/}
                    {/*/>*/}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <ChatAssistant />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;

import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePages";
import ChatPage from "./pages/ChatPages";
import VoiceCallComponent from "./Context/VoiceCall";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" Component={HomePage} exact />
        <Route path="/chats" Component={ChatPage} />
        <Route path="/call" Component={VoiceCallComponent} />
      </Routes>
    </div>
  );
}

export default App;

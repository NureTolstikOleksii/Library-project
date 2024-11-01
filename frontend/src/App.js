import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';
import Header from './Components/Header';
import Home from './Pages/Home';
import Readers from './Pages/Readers';
import UserInfo from './Pages/UserInfo'
import Departments from './Pages/Departments';
import Footer from './Components/Footer';

function App() {
    return (
      <div>
            <Header />
            <Router>
                <Routes>
                    <Route exact path="/" Component={Home} />
                    <Route exact path="/readers" Component={Readers} />
                    <Route exact path="/readers/:readerId/borrows" Component={UserInfo} />
                    <Route exact path="/departments" Component={Departments} />
                </Routes>
            </Router>
            <Footer />
      </div>
    );
}
export default App;

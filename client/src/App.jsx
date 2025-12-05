import './App.css';
import Banner from './Components/Banner';
import Chatbot from './Components/ChatBot';
import Footer from './Components/Footer';
import Header from './Components/Header';
import HomePage from './Components/HomePage';

function App() {
    return (
        <div>
            <header>
                <Header />
            </header>

            <main>
                <Banner />

                <div className="w-full  bg-black pt-10">
                    <HomePage />
                </div>
            </main>

            <Chatbot />

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default App;

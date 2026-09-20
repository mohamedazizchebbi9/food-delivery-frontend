import Navbar from "./Navbar";

function Layout({ children }) {

    return (

        <div className="app">

            <Navbar />

            <main className="content">

                {children}

            </main>

        </div>

    );
}

export default Layout;
import { Link } from "react-router-dom";
import { MessageSquare, Settings } from "lucide-react";

const Navbar = () => {
    return (
        <header className="w-full h-16 fixed top-0 left-0 z-50 
    bg-[#1a0f14]/80 backdrop-blur-md border-b border-white/5">

            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[#2a1a20] flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-orange-400" />
                    </div>
                    <span className="text-lg font-semibold text-white">Chatty</span>
                </Link>

                {/* Right Side */}
                <Link
                    to="/settings"
                    className="flex items-center gap-2 text-sm text-orange-300 hover:text-orange-400 transition"
                >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                </Link>

            </div>
        </header>
    );
};

export default Navbar;
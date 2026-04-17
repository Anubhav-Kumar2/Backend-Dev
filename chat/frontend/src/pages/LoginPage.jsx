import { Link } from "react-router-dom";
import { MessageSquare, Mail, Lock } from "lucide-react";

const LoginPage = () => {
    return (
        <div className="min-h-screen bg-[#1a0f14] text-white flex">

            {/* LEFT SIDE (FORM) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
                <div className="w-full max-w-md space-y-6">

                    {/* Logo */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[#2a1a20] flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-orange-400" />
                        </div>
                        <h2 className="text-2xl font-bold">Welcome Back</h2>
                        <p className="text-sm text-gray-400">
                            Sign in to your account
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">

                        {/* Email */}
                        <div>
                            <label className="text-sm text-gray-400">Email</label>
                            <div className="flex items-center mt-1 bg-[#2a1a20] rounded-lg px-3">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="w-full bg-transparent px-2 py-3 outline-none text-sm"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-sm text-gray-400">Password</label>
                            <div className="flex items-center mt-1 bg-[#2a1a20] rounded-lg px-3">
                                <Lock className="w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-transparent px-2 py-3 outline-none text-sm"
                                />
                            </div>
                        </div>

                        {/* Button */}
                        <button className="w-full py-3 rounded-lg bg-orange-400 text-black font-medium hover:bg-orange-500 transition">
                            Sign in
                        </button>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-400">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-orange-400 hover:underline">
                            Create account
                        </Link>
                    </p>

                </div>
            </div>

            {/* RIGHT SIDE (GRID DESIGN) */}
            <div className="hidden lg:flex w-1/2 items-center justify-center bg-[#140b10]">
                <div className="grid grid-cols-3 gap-4">
                    {[...Array(9)].map((_, i) => (
                        <div
                            key={i}
                            className="w-24 h-24 bg-[#2a1a20] rounded-xl"
                        />
                    ))}
                </div>

                {/* Text */}
                <div className="absolute bottom-20 text-center">
                    <h2 className="text-xl font-semibold text-orange-300">
                        Welcome back!
                    </h2>
                    <p className="text-sm text-gray-400 mt-2">
                        Sign in to continue your conversations and catch up with your messages.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default LoginPage;
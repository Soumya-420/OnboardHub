
import Link from 'next/link';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/40 backdrop-blur-xl mt-auto relative z-10">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-sm">
                            🚀
                        </div>
                        <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            OnboardHub
                        </span>
                    </div>

                    <div className="text-gray-400 text-sm flex items-center gap-1">
                        © 2026 OnboardHub. Made for <span className="text-white font-semibold">Winter Of Code 5.0</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="https://discord.gg/onboardhub" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 hover:text-blue-300 transition-all font-medium text-sm group">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Join Discord
                        </Link>
                        <div className="flex gap-4">
                            <div className="p-2 rounded-full bg-white/5 text-gray-500">
                                <Github className="w-5 h-5" />
                            </div>
                            <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-600 transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

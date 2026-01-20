import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const TypewriterHero = () => {
    const [line1, setLine1] = useState("");
    const [line2, setLine2] = useState("");
    const [line3, setLine3] = useState("");
    const [activeLine, setActiveLine] = useState(1); // 1, 2, or 3

    const fullLine1 = "Stop Staring at";
    const fullLine2 = "CONTRIBUTING.md";
    const fullLine3 = "Start Coding....";

    const TypingCursor = () => (
        <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            className="inline-block w-2 md:w-3 h-8 md:h-20 bg-blue-500 ml-1 align-middle shadow-[0_0_15px_rgba(59,130,246,0.8)]"
            style={{ marginBottom: "4px" }}
        />
    );

    useEffect(() => {
        let currentLine = 1;
        let currentIndex = 0;

        const typeChar = () => {
            if (currentLine === 1) {
                if (currentIndex < fullLine1.length) {
                    setLine1(prev => fullLine1.slice(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    currentLine = 2;
                    setActiveLine(2);
                    currentIndex = 0;
                }
            } else if (currentLine === 2) {
                if (currentIndex < fullLine2.length) {
                    setLine2(prev => fullLine2.slice(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    currentLine = 3;
                    setActiveLine(3);
                    currentIndex = 0;
                }
            } else if (currentLine === 3) {
                if (currentIndex < fullLine3.length) {
                    setLine3(prev => fullLine3.slice(0, currentIndex + 1));
                    currentIndex++;
                }
            }
        };

        // Slow speed: 200ms per character
        const interval = setInterval(typeChar, 200);

        return () => clearInterval(interval);
    }, []);

    return (
        <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance leading-tight mb-8 min-h-[350px] md:min-h-[auto] flex flex-col items-center justify-center">
            {/* Line 1 */}
            <span className="block text-white h-[1.2em]">
                {line1}
                {activeLine === 1 && <TypingCursor />}
            </span>

            {/* Line 2 */}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 pb-2 h-[1.2em]">
                {line2}
                {activeLine === 2 && <TypingCursor />}
            </span>

            {/* Line 3 */}
            <span className="block text-white h-[1.2em]">
                {line3}
                {activeLine === 3 && <TypingCursor />}
            </span>
        </h1>
    );
};

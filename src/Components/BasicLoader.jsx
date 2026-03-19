import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

const BasicLoader = ({ onEnter }) => {
    const { progress } = useProgress();
    const [show, setShow] = useState(true);

    useEffect(() => {
 
    }, [progress]);

    if (!show) return null;

    return (
        <div className="basic-loader-container">
            <div className="basic-loader-content">
                {progress < 100 && (
                    <>
                        <div className="basic-loader-bar-container">
                            <div 
                                className="basic-loader-bar" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="basic-loader-text">
                            Loading ...
                        </div>
                    </>
                )}
                {progress === 100 && (
                    <div className="loader-instructions">
                        <p>Navigate with left 🖱️💙 & right 🖱️❤️ clicks and the scroll wheel 🔄</p>
                        <p>Enjoy 😊</p>
                        <button
                            className="enter-button"
                            onClick={() => {
                                onEnter?.();
                                setShow(false);
                            }}
                        >
                            Enter
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BasicLoader;

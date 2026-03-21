import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Room from "./room";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useControls } from "leva";
import { useEffect, useState } from "react";

function Scene({ hasEntered }) {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [mobilePopup, setMobilePopup] = useState(null);
    const worksUrls = [
        "https://shinobi-clash.vercel.app/",
        "https://online-rock-paper-scissors-game.vercel.app/",
        "https://todo-list-app-with-dark-mode-drag-and-drop-functiona-6c2ezeuq1.vercel.app/"
    ];
    const worksTitles = [
        "2D Side Scroll Game",
        "Rock Paper Scissors Online Game",
        "To Do List Application"
    ];
    const worksPreviewImages = [
        "/backgrounds/works-1.png",
        "/backgrounds/works-2.png",
        "/backgrounds/works-3.png"
    ];

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const roomScale = windowWidth <= 768 ? 0.4 : windowWidth <= 1024 ? 0.6 : windowWidth <= 1350 ? 0.8 : 1;
    const isSmallScreen = windowWidth <= 900;

    const handleDownloadClick = () => {
        const link = document.createElement("a");
        link.href = "/resume.pdf";
        link.download = "resume.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div id="canvas-container">
            <Canvas
                camera={{
                    fov: 32,
                    near: 0.1,
                    far: 1000,
                    position: [20, 5, -13],
                    rotation: [10, 0, 0]
                }}
                gl={{
                    physicallyCorrectLights: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    outputColorSpace: THREE.SRGBColorSpace,
                    toneMappingExposure: 1.5
                }}
            >
                <color attach="background" args={["#220258"]} />
                <PerspectiveCamera makeDefault fov={32} near={0.1} far={1000} position={[20, 5, -13]} rotation={[10, 0, 0]} />

                <EffectComposer>
                    <Bloom
                        intensity={3.0}
                        kernelSize={3}
                        luminanceThreshold={0.1}
                        luminanceSmoothing={4.1}
                        mipmapBlur={true}
                        layers={1}
                    />
                </EffectComposer>

                <ambientLight intensity={0.2} />

                <directionalLight
                    position={[5, 8, 5]}
                    intensity={1.5}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />

                <pointLight
                    position={[-4, 3, -4]}
                    intensity={1}
                    color="#ff00aa"
                />

                <Environment preset="city" />
                <Room
                    scale={[roomScale, roomScale, roomScale]}
                    onOpenMobilePopup={setMobilePopup}
                    startIntroAnimation={hasEntered}
                />

                <OrbitControls
                zoomSpeed={5}
                    makeDefault
                    target={[0, 4, 0]}
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}

                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2}

                    minAzimuthAngle={-Math.PI / -4}
                    maxAzimuthAngle={Math.PI / 1}
                    minDistance={.1}
                    maxDistance={25}
                    onEnd={(e) => {
                        {/* ← changed to onChange so you see values WHILE moving/zooming */ }
                        const controls = e.target;
                        const t = controls.target;
                        const c = controls.object; {/* this is your camera */ }

                        const distance = c.position.distanceTo(t); {/* this is the real "zoom" value */ }

                    }}
                />
            </Canvas>
            {mobilePopup && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(10, 10, 25, 0.72)",
                        backdropFilter: "blur(8px)",
                        padding: "1rem",
                        zIndex: 9999
                    }}
                    onClick={() => setMobilePopup(null)}
                >
                    <div
                        style={{
                            width: "90vw",
                            maxHeight: "84vh",
                            overflowY: "auto",
                            borderRadius: "18px",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            background: "linear-gradient(160deg, rgba(26, 22, 58, 0.98), rgba(16, 14, 34, 0.98))",
                            boxShadow: "0 20px 45px rgba(0,0,0,0.45)",
                            padding: "1rem"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                            <h3 style={{ margin: 0, color: "#fff", fontSize: "1.2rem", textTransform: "capitalize" }}>{mobilePopup}</h3>
                            <button
                                onClick={() => setMobilePopup(null)}
                                style={{
                                    border: "none",
                                    borderRadius: "10px",
                                    background: "rgba(255,255,255,0.12)",
                                    color: "#fff",
                                    cursor: "pointer",
                                    width: "34px",
                                    height: "34px",
                                    fontSize: "1.1rem"
                                }}
                            >
                                x
                            </button>
                        </div>

                        {mobilePopup === "about" && (
                            <div style={{ color: "#dce1ff", marginTop: "0.9rem", lineHeight: 1.6 }}>
                                <p style={{ marginTop: 0 }}>
                                    Hello, I&apos;m Saad Hesham, a frontend developer with 2 years of experience.
                                </p>
                                <button
                                    onClick={handleDownloadClick}
                                    style={{
                                        padding: "0.75rem 1rem",
                                        borderRadius: "12px",
                                        border: "none",
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        color: "#fff",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        width: "100%"
                                    }}
                                >
                                    Download Resume
                                </button>
                            </div>
                        )}

                        {mobilePopup === "skills" && (
                            <div style={{ color: "#dce1ff", marginTop: "0.9rem" }}>
                                <p style={{ marginTop: 0, marginBottom: "0.8rem" }}>HTML, CSS, JavaScript, React, Blender, Python, MySQL, FastAPI</p>
                            </div>
                        )}

                        {mobilePopup === "works" && (
                            <div style={{ marginTop: "0.9rem", display: "grid", gap: "0.9rem" }}>
                                {worksTitles.map((title, projectIndex) => (
                                    <div
                                        key={title}
                                        style={{
                                            border: "1px solid rgba(255,255,255,0.15)",
                                            borderRadius: "14px",
                                            overflow: "hidden",
                                            background: "rgba(255,255,255,0.04)"
                                        }}
                                    >
                                        <img
                                            src={worksPreviewImages[projectIndex]}
                                            alt={title}
                                            style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "contain" }}
                                        />
                                        <div style={{ padding: "0.8rem" }}>
                                            <p style={{ color: "#fff", margin: "0 0 0.65rem", fontWeight: 600 }}>{title}</p>
                                            <button
                                                onClick={() => window.open(worksUrls[projectIndex], "_blank")}
                                                style={{
                                                    padding: "0.6rem 0.8rem",
                                                    borderRadius: "10px",
                                                    border: "none",
                                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                    color: "#fff",
                                                    fontWeight: 700,
                                                    cursor: "pointer",
                                                    width: "100%"
                                                }}
                                            >
                                                View Live
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {mobilePopup === "contact" && (
                            <div style={{ marginTop: "0.9rem", display: "grid", gap: "0.65rem" }}>
                                <button
                                    onClick={() => window.open("https://www.linkedin.com/in/saad-hesham-620a70232/", "_blank")}
                                    style={{
                                        padding: "0.75rem 1rem",
                                        borderRadius: "12px",
                                        border: "none",
                                        background: "linear-gradient(135deg, #0077b5 0%, #004f7c 100%)",
                                        color: "#fff",
                                        fontWeight: 700,
                                        cursor: "pointer"
                                    }}
                                >
                                    LinkedIn
                                </button>
                                <button
                                    onClick={() => window.open("https://github.com/Saad-Hisham", "_blank")}
                                    style={{
                                        padding: "0.75rem 1rem",
                                        borderRadius: "12px",
                                        border: "none",
                                        background: "linear-gradient(135deg, #333 0%, #111 100%)",
                                        color: "#fff",
                                        fontWeight: 700,
                                        cursor: "pointer"
                                    }}
                                >
                                    GitHub
                                </button>
                                <button
                                    onClick={() => { window.location.href = "mailto:saadhesham626@gmail.com"; }}
                                    style={{
                                        padding: "0.75rem 1rem",
                                        borderRadius: "12px",
                                        border: "none",
                                        background: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)",
                                        color: "#fff",
                                        fontWeight: 700,
                                        cursor: "pointer"
                                    }}
                                >
                                    Email Me
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Scene;




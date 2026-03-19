

import React, { useRef, useEffect, useState } from 'react'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import gsap from 'gsap'
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from 'three'
const Room = ({ onOpenMobilePopup, startIntroAnimation = false, ...props }) => {




  const { camera, controls } = useThree()
  const [scaled, setScaled] = useState(false)
  const [isWorksMode, setIsWorksMode] = useState(false)
  const [scrollCount, setScrollCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  const defaultTextures = useTexture([
    "/backgrounds/image-1.png",
    "/backgrounds/image-2.png",
    "/backgrounds/image-3.png",
    "/backgrounds/image-4.png",
    "/backgrounds/image-5.png",
    "/backgrounds/image-6.png"
  ])

  const worksTextures = useTexture([
    "/backgrounds/works-1.png",
    "/backgrounds/works-2.png",
    "/backgrounds/works-3.png"
  ])

  const worksUrls = [
    "https://shinobi-clash.vercel.app/",
    "https://online-rock-paper-scissors-game.vercel.app/",
    "https://todo-list-app-with-dark-mode-drag-and-drop-functiona-6c2ezeuq1.vercel.app/"
  ]

  const worksTitles = [
    "2D Side Scroll Game",
    "Rock Paper Scissors Online Game",
    "To Do List Application"
  ]
  const worksPreviewImages = [
    "/backgrounds/works-1.png",
    "/backgrounds/works-2.png",
    "/backgrounds/works-3.png"
  ]
  const isSmallScreen = windowWidth <= 900

  const textures = isWorksMode ? worksTextures : defaultTextures

  textures.forEach((t) => (t.flipY = false))
  worksTextures.forEach((t) => (t.flipY = false))


  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % textures.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [textures.length])

  useEffect(() => {
    setIndex(0)
    setScrollCount(0)
  }, [isWorksMode])

  useEffect(() => {
    const handleWheel = (event) => {
      if (isWorksMode && event.deltaY > 0) {
        setScrollCount(prev => {
          if (prev + 1 >= 10) {
            setIsWorksMode(false)
            return 0
          }
          return prev + 1
        })
      }
    }

    window.addEventListener('wheel', handleWheel)
    return () => window.removeEventListener('wheel', handleWheel)
  }, [isWorksMode])

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const group = useRef()
  const introTlRef = useRef(null)
  const hasPlayedIntroRef = useRef(false)
  const ledLeftTopRef = useRef()
  const rightLdeRef = useRef()
  const actionsRef = useRef()
  const audioRef = useRef(null)


  useEffect(() => {
    audioRef.current = new Audio('/robot_move.mp3')
    audioRef.current.volume = 0.2
    audioRef.current.loop = true
  }, [])



  


  const { nodes, materials, animations } = useGLTF('/room.glb', true)
  const { actions } = useAnimations(animations, group)

  const animateCameraTo = (
    targetPosition,
    cameraPosition,
    cameraRotation,
    duration = 2,
    ease = "power2.inOut",
    onComplete = () => { }
  ) => {
    if (controls) {
      gsap.to(controls.target, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration,
        ease,
      });
    }

    gsap.to(camera.position, {
      x: cameraPosition.x,
      y: cameraPosition.y,
      z: cameraPosition.z,
      duration,
      ease,
      onUpdate: () => {
        controls?.update();
      },
    });

    gsap.to(camera.rotation, {
      x: cameraRotation.x,
      y: cameraRotation.y,
      z: cameraRotation.z,
      duration,
      ease,
      onComplete,
    });
  };
  const handleDownloadClick = () => {
    const link = document.createElement('a');
    link.href = '/resume.pdf';
    link.download = 'resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSectionClick = (section, desktopAction) => {
    if (isSmallScreen) {
      onOpenMobilePopup?.(section)
      return
    }
    desktopAction()
  }

  useEffect(() => {
    return () => {
      introTlRef.current?.kill()
    }
  }, [])

  useEffect(() => {
    if (!startIntroAnimation || !group.current || hasPlayedIntroRef.current) return

    hasPlayedIntroRef.current = true
    const objectsToAnimate = []

    group.current.traverse((child) => {
      if (child === group.current || !child?.isObject3D || !child?.scale) return

      const targetScale = {
        x: child.scale.x || 0.001,
        y: child.scale.y || 0.001,
        z: child.scale.z || 0.001
      }

      child.userData.__introTargetScale = targetScale
      child.scale.set(0.001, 0.001, 0.001)
      objectsToAnimate.push(child)
    })

    const maxTotalDuration = 10
    const itemCount = Math.max(objectsToAnimate.length, 1)
    const step = maxTotalDuration / itemCount
    const itemDuration = Math.min(Math.max(step * 1.9, 0.08), 0.22)

    const timeline = gsap.timeline({
      defaults: { ease: "back.out(1.8)" }
    })

    objectsToAnimate.forEach((child) => {
      const targetScale = child.userData.__introTargetScale
      timeline.to(
        child.scale,
        {
          x: targetScale.x,
          y: targetScale.y,
          z: targetScale.z,
          duration: itemDuration
        },
        `>-${Math.max(itemDuration - step, 0)}`
      )
    })

    introTlRef.current = timeline
  }, [startIntroAnimation])

  useEffect(() => {
    if (materials.light) {
      materials.light.toneMapped = false
    }
    const excluded = new Set([
      "Empty.009Action.001",
      "CircleAction.001",
      "CircleAction.002",
      "football_jump"
    ])

    Object.entries(actions).forEach(([name, action]) => {
      if (!excluded.has(name)) action.play()
    })
    actionsRef.current = actions
    if (actionsRef.current["football_jump"]) {
      actionsRef.current["football_jump"].loop = THREE.LoopOnce
    }
    if (actionsRef.current["Empty.009Action.001"]) {
      actionsRef.current["Empty.009Action.001"].loop = THREE.LoopOnce
    }

    if (ledLeftTopRef.current) {
      ledLeftTopRef.current.layers.enable(1)
    }
    if (rightLdeRef.current) {
      rightLdeRef.current.layers.enable(1)
    }

    const planesToAnimate = [
      "Plane019", "Plane018", "Plane022", ,
      "Plane014", "Plane007", "Plane023", "Plane010", "Plane009"
    ]

    planesToAnimate.forEach((name, i) => {
      const obj = group.current.getObjectByName(name)
      if (obj) {
        gsap.to(obj.position, {
          y: obj.position.y + 0.3,
          duration: 1 + Math.random(),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.15
        })
      }
    })
  }, [actions, materials.light])


  function HoverTransform({
    children,

    hoverScale = [1.2, 1.2, 1.2],
    hoverRotation = [0, 0, 0],
    hoverPosition = [0, 0, 0],

    duration = 0.4,
    ease = "power2.out",

    ...props
  }) {
    const groupRef = useRef()
    const [hovered, setHovered] = useState(false)

    useEffect(() => {
      if (!groupRef.current) return

      const originals = new Map()

      groupRef.current.traverse((child) => {
        if (child.isMesh) {
          originals.set(child, {
            scale: child.scale.clone(),
            rotation: child.rotation.clone(),
            position: child.position.clone(),
          })
        }
      })

      groupRef.current.userData.originals = originals
    }, [])

    useEffect(() => {
      const originals = groupRef.current?.userData.originals
      if (!originals) return

      originals.forEach((orig, mesh) => {
        if (hovered) {
          gsap.to(mesh.scale, {
            x: orig.scale.x * hoverScale[0],
            y: orig.scale.y * hoverScale[1],
            z: orig.scale.z * hoverScale[2],
            duration,
            ease,
          })

          gsap.to(mesh.rotation, {
            x: orig.rotation.x + hoverRotation[0],
            y: orig.rotation.y + hoverRotation[1],
            z: orig.rotation.z + hoverRotation[2],
            duration,
            ease,
          })

          gsap.to(mesh.position, {
            x: orig.position.x + hoverPosition[0],
            y: orig.position.y + hoverPosition[1],
            z: orig.position.z + hoverPosition[2],
            duration,
            ease,
          })
        } else {
          gsap.to(mesh.scale, {
            x: orig.scale.x,
            y: orig.scale.y,
            z: orig.scale.z,
            duration,
            ease,
          })

          gsap.to(mesh.rotation, {
            x: orig.rotation.x,
            y: orig.rotation.y,
            z: orig.rotation.z,
            duration,
            ease,
          })

          gsap.to(mesh.position, {
            x: orig.position.x,
            y: orig.position.y,
            z: orig.position.z,
            duration,
            ease,
          })
        }
      })
    }, [hovered])

    return (
      <group
        ref={groupRef}
        {...props}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {children}
      </group>
    )
  }
  return (
    <>
      <group ref={group} {...props} dispose={null}>
      <group name="Scene">

        <mesh
          name="Plane"
          castShadow
          receiveShadow
          geometry={nodes.Plane.geometry}
          material={materials.Material}
          position={[3.448, 3.267, 2.526]}
          rotation={[1.882, 0, 0]}
        />
        <mesh
          name="screen001"
          castShadow
          receiveShadow
          geometry={nodes.screen001.geometry}
          material={materials['Material.058']}
          position={[0.354, 2.989, 2.592]}
          rotation={[Math.PI, 0, Math.PI]}
        />
        <group
          name="screen002"
          position={[1.463, 5.561, 3.36]}
          rotation={[Math.PI, 0, -Math.PI / 2]}
          scale={0.918}>
          <mesh
            name="Cube020_1"
            castShadow
            receiveShadow
            geometry={nodes.Cube020_1.geometry}
            material={materials.Base}
          />
          <mesh
            name="Cube020_2"
            castShadow
            receiveShadow
            geometry={nodes.Cube020_2.geometry}
            material={materials['Material.006']}
          />
        </group>
        <group
          name="Cylinder002"
          position={[-20.507, -15.541, 6.901]}
          rotation={[Math.PI / 2, 0, -Math.PI / 2]}
        />
        <group
          name="screen005"
          position={[1.582, 5.562, 3.36]}
          rotation={[Math.PI, 0, -Math.PI / 2]}
          scale={0.918}>
          <mesh
            name="Cube044"
            castShadow
            receiveShadow
            geometry={nodes.Cube044.geometry}
            material={materials.Base}
          />
          <mesh
            name="Cube044_1"
            castShadow
            receiveShadow
            geometry={nodes.Cube044_1.geometry}
            material={materials['Material.006']}
          />
        </group>
        <mesh
          name="Room"
          castShadow
          receiveShadow
          geometry={nodes.Room.geometry}
          material={materials['Material.049']}
          position={[0.761, 0.242, -0.201]}
          scale={[1.06, 1.055, 1.06]}
        />
        <mesh
          name="topedge"
          castShadow
          receiveShadow
          geometry={nodes.topedge.geometry}
          material={materials.metal}
          position={[2.852, 7.202, 3.616]}
          rotation={[Math.PI, 0, Math.PI]}
        />
        <mesh
          name="side_edge"
          castShadow
          receiveShadow
          geometry={nodes.side_edge.geometry}
          material={materials.metal}
          position={[-2.952, 7.022, -4.531]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <mesh
          name="right_side_cube"
          castShadow
          receiveShadow
          geometry={nodes.right_side_cube.geometry}
          material={materials.metal}
          position={[-2.749, 0.771, -4.494]}
        />
        <mesh
          name="wifi_base_side"
          castShadow
          receiveShadow
          geometry={nodes.wifi_base_side.geometry}
          material={materials.metal}
          position={[-2.72, 7.924, 2.097]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <mesh
          name="wifi_extra_side"
          castShadow
          receiveShadow
          geometry={nodes.wifi_extra_side.geometry}
          material={materials.metal}
          position={[-2.693, 8.139, 1.221]}
          rotation={[3.142, -Math.PI / 2, 0]}
        />
        <mesh
          name="topedge001"
          castShadow
          receiveShadow
          geometry={nodes.topedge001.geometry}
          material={materials.metal}
          position={[-3.032, 7.629, -2.349]}
          rotation={[0, -1.571, 0]}
        />
        <mesh
          name="right_side_border"
          castShadow
          receiveShadow
          geometry={nodes.right_side_border.geometry}
          material={materials.metal}
          position={[4.724, 2.434, 3.624]}
          rotation={[-Math.PI, 0, 0]}
        />
        <mesh
          name="Cube001"
          castShadow
          receiveShadow
          geometry={nodes.Cube001.geometry}
          material={materials.metal}
          position={[5.045, 0.756, 3.474]}
          rotation={[0, -1.557, 0]}
        />
        <mesh
          name="led_left_top"
          castShadow
          receiveShadow
          geometry={nodes.led_left_top.geometry}
          material={materials.light}
          position={[-2.951, 7.591, -0.783]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[1, 1, 0.948]}
        />
        <mesh
          name="right_lde"
          castShadow
          receiveShadow
          geometry={nodes.right_lde.geometry}
          material={materials['Material.085']}
          position={[-1.706, 7.419, 3.477]}
          rotation={[Math.PI, 0, Math.PI]}
        />
        <mesh
          name="base"
          castShadow
          receiveShadow
          geometry={nodes.base.geometry}
          material={materials.metal}
          position={[-3.096, 0.59, -4.769]}
        />
        <mesh
          name="heart_container"
          castShadow
          receiveShadow
          geometry={nodes.heart_container.geometry}
          material={materials.metal}
          position={[-2.819, 0.623, -4.811]}
        />
        <mesh
          name="icons_right_container"
          castShadow
          receiveShadow
          geometry={nodes.icons_right_container.geometry}
          material={materials.metal}
          position={[0.666, 0.646, -4.548]}
        />
        <mesh
          name="hexa"
          castShadow
          receiveShadow
          geometry={nodes.hexa.geometry}
          material={materials['Material.050']}
          position={[-0.82, 0.638, -5.115]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <mesh
          name="Cube003"
          castShadow
          receiveShadow
          geometry={nodes.Cube003.geometry}
          material={materials.light}
          position={[5.214, 0.544, 3.049]}
          scale={[1, 1.563, 1]}
        />
        <mesh
          name="heart"
          castShadow
          receiveShadow
          geometry={nodes.heart.geometry}
          material={materials['Material.044']}
          position={[2.058, 0.63, -5.053]}
        />
        <mesh
          name="Cube002"
          castShadow
          receiveShadow
          geometry={nodes.Cube002.geometry}
          material={materials.light}
          position={[-2.782, 0.588, -5.078]}
        />
        <mesh
          name="star"
          castShadow
          receiveShadow
          geometry={nodes.star.geometry}
          material={materials['Material.045']}
          position={[-0.817, 0.672, -5.161]}
        />
        <group name="Cube007" position={[-4.53, -8.169, -5.168]} />
        <mesh
          name="Cube009"
          castShadow
          receiveShadow
          geometry={nodes.Cube009.geometry}
          material={materials['Material.042']}
          position={[4.176, 0.438, -2.935]}
        />
        <mesh
          name="Cylinder"
          castShadow
          receiveShadow
          geometry={nodes.Cylinder.geometry}
          material={materials['Material.047']}
          position={[0.823, 0.668, -5.057]}
          rotation={[1.571, 0.011, -0.002]}
        />
        <mesh
          name="Cube005"
          castShadow
          receiveShadow
          geometry={nodes.Cube005.geometry}
          material={materials.light}
          position={[-2.943, 6.387, -4.799]}
        />
        <mesh
          name="Cube006"
          castShadow
          receiveShadow
          geometry={nodes.Cube006.geometry}
          material={materials.light}
          position={[-2.943, 1.436, -4.81]}
          rotation={[0, 0, -Math.PI / 2]}
        />
        <mesh
          name="Cube010"
          castShadow
          receiveShadow
          geometry={nodes.Cube010.geometry}
          material={materials['Material.043']}
          position={[5.114, 5.825, 3.633]}
          rotation={[-Math.PI, 0, 0]}
          scale={[-0.23, -1, -1]}
        />
        <mesh
          name="Cube011"
          castShadow
          receiveShadow
          geometry={nodes.Cube011.geometry}
          material={materials.light}
          position={[5.144, 5.212, 3.633]}
          rotation={[-Math.PI, 0, 0]}
          scale={[-0.227, -1, -1]}
        />
        <mesh
          name="wifi-signal"
          castShadow
          receiveShadow
          geometry={nodes['wifi-signal'].geometry}
          material={materials['Material.048']}
          position={[-2.668, 8.409, 1.101]}
          rotation={[1.57, -0.009, -1.562]}
        />
        <mesh
          name="Cube008"
          castShadow
          receiveShadow
          geometry={nodes.Cube008.geometry}
          material={materials.light}
          position={[-0.133, 0.845, -5.15]}
        />
        <mesh
          name="Cube012"
          castShadow
          receiveShadow
          geometry={nodes.Cube012.geometry}
          material={materials.light}
          position={[-0.133, 0.576, -5.111]}
        />
        <mesh
          name="Cube013"
          castShadow
          receiveShadow
          geometry={nodes.Cube013.geometry}
          material={materials.Base}
          position={[-1.851, 2.593, 2.386]}
        />
        <mesh
          name="screen_holder"
          castShadow
          receiveShadow
          geometry={nodes.screen_holder.geometry}
          material={materials.Base}
          position={[0.521, 3.067, 2.566]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <group
          name="keyboard_mouse"
          position={[0.605, 2.621, 2.264]}
          rotation={[-Math.PI / 2, 0, -Math.PI]}>
          <group name="KEYBOARD_EXPobjcleanermaterialmergergles" position={[0.221, 0.025, 0]}>
            <mesh
              name="Object_2"
              castShadow
              receiveShadow
              geometry={nodes.Object_2.geometry}
              material={materials.light}
              position={[0, -0.211, 0.039]}
              scale={0.837}
            />
            <mesh
              name="Object_3"
              castShadow
              receiveShadow
              geometry={nodes.Object_3.geometry}
              material={materials.Base}
              position={[0, -0.211, 0.039]}
              scale={0.837}
            />
            <mesh
              name="Object_4"
              castShadow
              receiveShadow
              geometry={nodes.Object_4.geometry}
              material={materials.Base}
              position={[0.122, -0.253, 0.027]}
              scale={0.684}
            />
          </group>
        </group>
        <group name="root" position={[2.579, 2.593, 2.544]} rotation={[-Math.PI / 2, 0, 0]}>
          <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
            <group
              name="Cylinder001_1"
              position={[0.035, 0.479, 0.074]}
              rotation={[0.178, -0.076, -0.035]}>
              <mesh
                name="Object_10"
                castShadow
                receiveShadow
                geometry={nodes.Object_10.geometry}
                material={nodes.Object_10.material}
              />
              <mesh
                name="Object_6"
                castShadow
                receiveShadow
                geometry={nodes.Object_6.geometry}
                material={nodes.Object_6.material}
              />
              <mesh
                name="Object_7"
                castShadow
                receiveShadow
                geometry={nodes.Object_7.geometry}
                material={nodes.Object_7.material}
              />
              <mesh
                name="Object_8"
                castShadow
                receiveShadow
                geometry={nodes.Object_8.geometry}
                material={materials['Material.004']}
              />
              <mesh
                name="Object_9"
                castShadow
                receiveShadow
                geometry={nodes.Object_9.geometry}
                material={materials['Material.005']}
              />
            </group>
            <group
              name="Cylinder002_2"
              position={[0.069, 0.437, 0.042]}
              rotation={[-0.014, -0.178, -0.092]}>
              <mesh
                name="Object_12"
                castShadow
                receiveShadow
                geometry={nodes.Object_12.geometry}
                material={nodes.Object_12.material}
              />
              <mesh
                name="Object_13"
                castShadow
                receiveShadow
                geometry={nodes.Object_13.geometry}
                material={nodes.Object_13.material}
              />
            </group>
            <group
              name="Cylinder003_3"
              position={[-0.008, 0.442, 0.077]}
              rotation={[0.178, -0.076, -0.035]}>
              <mesh
                name="Object_15"
                castShadow
                receiveShadow
                geometry={nodes.Object_15.geometry}
                material={nodes.Object_15.material}
              />
              <mesh
                name="Object_16"
                castShadow
                receiveShadow
                geometry={nodes.Object_16.geometry}
                material={materials['Material.059']}
              />
            </group>
            <group
              name="Cylinder004_4"
              position={[0.071, 0.493, -0.019]}
              rotation={[-0.236, -0.312, -0.33]}>
              <mesh
                name="Object_18"
                castShadow
                receiveShadow
                geometry={nodes.Object_18.geometry}
                material={nodes.Object_18.material}
              />
              <mesh
                name="Object_19"
                castShadow
                receiveShadow
                geometry={nodes.Object_19.geometry}
                material={materials['Material.064']}
              />
            </group>
            <group
              name="Cylinder005_5"
              position={[0.04, 0.393, -0.048]}
              rotation={[-0.29, -0.557, -0.049]}>
              <mesh
                name="Object_21"
                castShadow
                receiveShadow
                geometry={nodes.Object_21.geometry}
                material={nodes.Object_21.material}
              />
              <mesh
                name="Object_22"
                castShadow
                receiveShadow
                geometry={nodes.Object_22.geometry}
                material={nodes.Object_22.material}
              />
            </group>
            <group
              name="Cylinder006_6"
              position={[-0.042, 0.479, -0.071]}
              rotation={[-0.217, 0.038, -0.042]}>
              <mesh
                name="Object_24"
                castShadow
                receiveShadow
                geometry={nodes.Object_24.geometry}
                material={nodes.Object_24.material}
              />
              <mesh
                name="Object_25"
                castShadow
                receiveShadow
                geometry={nodes.Object_25.geometry}
                material={materials['Material.012']}
              />
            </group>
            <group
              name="Cylinder007_7"
              position={[-0.066, 0.52, 0.042]}
              rotation={[0.069, 0.072, 0.171]}>
              <mesh
                name="Object_27"
                castShadow
                receiveShadow
                geometry={nodes.Object_27.geometry}
                material={materials['Material.062']}
              />
              <mesh
                name="Object_28"
                castShadow
                receiveShadow
                geometry={nodes.Object_28.geometry}
                material={nodes.Object_28.material}
              />
              <mesh
                name="Object_29"
                castShadow
                receiveShadow
                geometry={nodes.Object_29.geometry}
                material={materials['Material.004']}
              />
              <mesh
                name="Object_30"
                castShadow
                receiveShadow
                geometry={nodes.Object_30.geometry}
                material={materials['Material.005']}
              />
              <mesh
                name="Object_31"
                castShadow
                receiveShadow
                geometry={nodes.Object_31.geometry}
                material={nodes.Object_31.material}
              />
            </group>
            <group
              name="Cylinder008_8"
              position={[0.018, 0.495, -0.08]}
              rotation={[-0.176, -0.032, 0.078]}>
              <mesh
                name="Object_33"
                castShadow
                receiveShadow
                geometry={nodes.Object_33.geometry}
                material={materials['Material.065']}
              />
              <mesh
                name="Object_34"
                castShadow
                receiveShadow
                geometry={nodes.Object_34.geometry}
                material={nodes.Object_34.material}
              />
              <mesh
                name="Object_35"
                castShadow
                receiveShadow
                geometry={nodes.Object_35.geometry}
                material={materials['Material.004']}
              />
              <mesh
                name="Object_36"
                castShadow
                receiveShadow
                geometry={nodes.Object_36.geometry}
                material={materials['Material.005']}
              />
              <mesh
                name="Object_37"
                castShadow
                receiveShadow
                geometry={nodes.Object_37.geometry}
                material={nodes.Object_37.material}
              />
            </group>
            <group name="Cylinder_0" position={[0, 0.354, 0]}>
              <mesh
                name="Object_4001"
                castShadow
                receiveShadow
                geometry={nodes.Object_4001.geometry}
                material={materials.Base}
              />
            </group>
          </group>
        </group>
        <mesh
          name="right_side_border003"
          castShadow
          receiveShadow
          geometry={nodes.right_side_border003.geometry}
          material={nodes.right_side_border003.material}
          position={[0.428, 3.839, 3.183]}
          rotation={[Math.PI, 0, Math.PI]}
        />
        <mesh
          name="right_side_border004"
          castShadow
          receiveShadow
          geometry={nodes.right_side_border004.geometry}
          material={nodes.right_side_border004.material}
          position={[0.428, 3.839, 3.183]}
          rotation={[Math.PI, 0, Math.PI]}
        />
        <mesh
          name="right_side_border006"
          castShadow
          receiveShadow
          geometry={nodes.right_side_border006.geometry}
          material={materials.Base}
          position={[3.041, 3.839, 2.886]}
          rotation={[Math.PI, 0, Math.PI]}
        />
        <mesh
          name="Cube023"
          castShadow
          receiveShadow
          geometry={nodes.Cube023.geometry}
          material={materials.light}
          position={[5.366, 0.365, -1.9]}
          rotation={[0, -1.553, 0]}
          scale={0.686}
        />
        <mesh
          name="Cube"
          castShadow
          receiveShadow
          geometry={nodes.Cube.geometry}
          material={materials.light}
          position={[2.996, 2.541, 2.455]}
        />
        <mesh
          name="Cube014"
          castShadow
          receiveShadow
          geometry={nodes.Cube014.geometry}
          material={materials.Base}
          position={[-2.706, 6.034, -2.357]}
        />
        <mesh
          name="Cube015"
          castShadow
          receiveShadow
          geometry={nodes.Cube015.geometry}
          material={materials.Base}
          position={[-3.24, 4.35, -2.386]}
        />
        <mesh
          name="Text"
          castShadow
          receiveShadow
          geometry={nodes.Text.geometry}
          material={materials['Material.054']}
          position={[5.296, 0.339, -1.082]}
          rotation={[Math.PI / 2, 0, -1.569]}
          scale={[0.319, 0.322, 0.319]}
        />
        <mesh
          name="Circle001"
          castShadow
          receiveShadow
          geometry={nodes.Circle001.geometry}
          material={materials.Base}
          position={[1.975, 2.759, 1.772]}
          rotation={[0, 0.562, 0]}
          scale={0.248}
        />
        <group
          name="Sketchfab_model"
          position={[0.607, 2.734, 2.263]}
          rotation={[-Math.PI / 2, 0, -3.14]}
          scale={0.139}>
          <group name="Figuresfbx" rotation={[Math.PI / 2, 0, 0]}>
            <group name="RootNode">
              <group name="Gumi_Figure" position={[6.305, 0, 0]}>
                <group name="Figure_bottom4">
                  <group name="Circle6" rotation={[Math.PI / 2, 0, 0]} scale={1.763}>
                    <mesh
                      name="Circle6__0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Circle6__0.geometry}
                      material={materials.Circle6__0}
                    />
                  </group>
                </group>

                <HoverTransform
                  hoverScale={[1.2, 1.2, 1.2]}
                  hoverRotation={[0, Math.PI * 2, 0]}
                  hoverPosition={[0, 0, 0]}
                  duration={1}
                >
                  <group name="Gumi">

                    <group name="Gumiobj_1"

                    >
                      <mesh
                        name="Gumiobj_1_ctr_gumh001_hitemalpha_1Material_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.Gumiobj_1_ctr_gumh001_hitemalpha_1Material_0.geometry}
                        material={materials.ctr_gumh001_hitemalpha_1Material}
                      />
                      <mesh
                        name="Gumiobj_1_test_lambert2_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.Gumiobj_1_test_lambert2_0.geometry}
                        material={materials.test_lambert2}
                      />
                    </group>
                  </group>

                </HoverTransform>
              </group>


              <HoverTransform
                hoverScale={[1.2, 1.2, 1.2]}
                hoverRotation={[0, Math.PI * 2, 0]}
                hoverPosition={[0, 0, 0]}
                duration={1}
              >
                <group name="Hatsune_miku_Figure" position={[-6.195, 0, 0]}

                >

                  <group name="Circle002" rotation={[Math.PI / 2, 0, 0]} scale={1.763}>
                    <mesh
                      name="Circle__0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Circle__0.geometry}
                      material={materials.Circle6__0}
                    />
                  </group>
                  <group name="MikuFigure">
                    <group name="MikuFigureobj_1">
                      <mesh
                        name="MikuFigureobj_1_test_test_alpha_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.MikuFigureobj_1_test_test_alpha_0.geometry}
                        material={materials.test_test_alpha}
                      />
                      <mesh
                        name="MikuFigureobj_1_test_test_te_000_r1_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.MikuFigureobj_1_test_test_te_000_r1_0.geometry}
                        material={materials.test_test_te_000_r1}
                      />
                    </group>
                  </group>
                </group>
              </HoverTransform>

              <HoverTransform
                hoverScale={[1.2, 1.2, 1.2]}
                hoverRotation={[0, Math.PI * 2, 0]}
                hoverPosition={[0, 0, 0]}
                duration={1}
              >
                <group name="Kaito_Figure" position={[-3.695, 0, 0]}>

                  <group name="Figure_bottom">
                    <group name="Circle2" rotation={[Math.PI / 2, 0, 0]} scale={1.763}>
                      <mesh
                        name="Circle2__0"
                        castShadow
                        receiveShadow
                        geometry={nodes.Circle2__0.geometry}
                        material={materials.Circle6__0}
                      />
                    </group>
                  </group>
                  <group name="KaitoFigure">
                    <group name="KaitoFigureobj_1">
                      <mesh
                        name="KaitoFigureobj_1_lambert2_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.KaitoFigureobj_1_lambert2_0.geometry}
                        material={materials.lambert2}
                      />
                      <mesh
                        name="KaitoFigureobj_1_lambert2_0001"
                        castShadow
                        receiveShadow
                        geometry={nodes.KaitoFigureobj_1_lambert2_0001.geometry}
                        material={materials.lambert2}
                        position={[18.591, 0.023, 6.574]}
                        rotation={[Math.PI, -0.16, Math.PI]}
                        scale={0.474}
                      />
                    </group>
                  </group>
                </group>
              </HoverTransform>


              <HoverTransform
                hoverScale={[1.2, 1.2, 1.2]}
                hoverRotation={[0, Math.PI * 2, 0]}
                hoverPosition={[0, 0, 0]}
                duration={1}
              >
                <group name="Len_Figure" position={[1.305, 0, 0]}>

                  <group name="Figure_bottom2">
                    <group name="Circle4" rotation={[Math.PI / 2, 0, 0]} scale={1.763}>
                      <mesh
                        name="Circle4__0"
                        castShadow
                        receiveShadow
                        geometry={nodes.Circle4__0.geometry}
                        material={materials.Circle6__0}
                      />
                    </group>
                  </group>
                  <group name="LenFigure">
                    <group name="LenFigureobj_1">
                      <mesh
                        name="LenFigureobj_1_ren_s004_algha_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.LenFigureobj_1_ren_s004_algha_0.geometry}
                        material={materials.ren_s004_algha}
                      />
                      <mesh
                        name="LenFigureobj_1_ren_s4_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.LenFigureobj_1_ren_s4_0.geometry}
                        material={materials.ren_s4}
                      />
                    </group>
                  </group>
                </group>

              </HoverTransform>

              <HoverTransform
                hoverScale={[1.2, 1.2, 1.2]}
                hoverRotation={[0, Math.PI * 2, 0]}
                hoverPosition={[0, 0, 0]}
                duration={1}
              >

                <group name="Meiko_Figure" position={[3.805, 0, 0]}>

                  <group name="Figure_bottom3">
                    <group name="Circle5" rotation={[Math.PI / 2, 0, 0]} scale={1.763}>
                      <mesh
                        name="Circle5__0"
                        castShadow
                        receiveShadow
                        geometry={nodes.Circle5__0.geometry}
                        material={materials.Circle6__0}
                      />
                    </group>
                  </group>
                  <group name="MeikoFigure">
                    <group name="MeikoFigureobj_1">
                      <mesh
                        name="MeikoFigureobj_1_meiko_all_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.MeikoFigureobj_1_meiko_all_0.geometry}
                        material={materials.meiko_all}
                      />
                    </group>
                  </group>
                </group>

              </HoverTransform>


              <HoverTransform
                hoverScale={[1.2, 1.2, 1.2]}
                hoverRotation={[0, Math.PI * 2, 0]}
                hoverPosition={[0, 0, 0]}
                duration={1}
              >
                <group name="Rin_Figure" position={[-1.195, 0, 0]}>
                  <group name="Figure_bottom1">
                    <group
                      name="Circle3"
                      position={[0.032, 0, 0]}
                      rotation={[Math.PI / 2, 0, 0]}
                      scale={1.763}>
                      <mesh
                        name="Circle3__0"
                        castShadow
                        receiveShadow
                        geometry={nodes.Circle3__0.geometry}
                        material={materials.Circle6__0}
                      />
                    </group>
                  </group>
                  <group name="RinFigure">
                    <group name="RinFigureobj_1">
                      <mesh
                        name="RinFigureobj_1_rin_S003_Alpha_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.RinFigureobj_1_rin_S003_Alpha_0.geometry}
                        material={materials.rin_S003_Alpha}
                      />
                      <mesh
                        name="RinFigureobj_1_rin_S003_Diffuse_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.RinFigureobj_1_rin_S003_Diffuse_0.geometry}
                        material={materials.rin_S003_Diffuse}
                      />
                    </group>
                  </group>
                </group>

              </HoverTransform>
            </group>
          </group>
        </group>

        <group
          name="Sketchfab_model001"
          position={[2.429, 2.751, 2.03]}
          rotation={[-Math.PI / 2, 0, 3.097]}
          scale={1.836}>
          <group
            name="357e8906e1ed4020b649e447185dae7cfbx"
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.01}>
            <group name="RootNode001">
              <group name="Headphone_stand_v2" rotation={[-Math.PI / 2, 0, 0]} scale={0.1}>
                <group name="Body1" scale={10}>

                  <mesh
                    name="Body1_Carbon_Fiber_-_Twill_0"
                    castShadow
                    receiveShadow
                    geometry={nodes['Body1_Carbon_Fiber_-_Twill_0'].geometry}
                    material={materials.Base}
                    position={[-14.947, -6.146, -0.616]}
                    rotation={[0, 0, -0.016]}
                    scale={1.216}
                  />
                </group>
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model002"
          position={[2.755, 2.725, 1.943]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={0.584}>
          <HoverTransform
            hoverScale={[1.2, 1.2, 1.2]}
            hoverRotation={[0, 0, 0]}
            hoverPosition={[0, 0, 0]}
            duration={1}
          >
            <group name="Headphones_finalobjcleanermaterialmergergles">

              <mesh
                name="Object_2001"
                castShadow
                receiveShadow
                geometry={nodes.Object_2001.geometry}
                material={materials.blinn1SG}
                position={[-0.077, 0.15, 0.4]}
                rotation={[-0.121, 0.001, -0.12]}
                scale={0.724}
              />
            </group>
          </HoverTransform>
        </group>
        <group
          name="Spot"
          position={[-1.288, 0.169, -9.609]}
          rotation={[0.043, -0.15, -1.742]}
          scale={[3.352, 3.311, 10.204]}>
          <group name="Spot001" />
        </group>
        <HoverTransform
          hoverScale={[1.2, 1.2, 1.2]}
          hoverRotation={[0, 0, 0]}
          hoverPosition={[1, 0, 0]}
          duration={1}
        >
          <mesh
            name="Curve"
            castShadow
            receiveShadow
            geometry={nodes.Curve.geometry}
            material={materials['Material.007']}
            position={[-2.906, 5.887, 1.397]}
            rotation={[Math.PI / 2, 0, -Math.PI / 2]}
            scale={[0.761, 0.761, 0.796]}
          />
          <mesh
            name="Curve002"
            castShadow
            receiveShadow
            geometry={nodes.Curve002.geometry}
            material={materials['Material.008']}
            position={[-2.875, 5.911, 1.407]}
            rotation={[Math.PI / 2, 0, -Math.PI / 2]}
            scale={[0.761, 0.761, 0.796]}
          />
        </HoverTransform>
        <HoverTransform
          hoverScale={[1.2, 1.2, 1.2]}
          hoverRotation={[0, 0, 0]}
          hoverPosition={[.5, 0, 0]}
          duration={1}
        >
          <mesh
            name="Curve001"
            castShadow
            receiveShadow
            geometry={nodes.Curve001.geometry}
            material={materials['Material.010']}
            position={[-2.84, 5.39, 2.231]}
            rotation={[-Math.PI / 2, 0, -1.574]}
            scale={-0.83}
          />
          <mesh
            name="Curve004"
            castShadow
            receiveShadow
            geometry={nodes.Curve004.geometry}
            material={materials['Material.009']}
            position={[-2.818, 5.426, 2.247]}
            rotation={[-Math.PI / 2, 0, -1.574]}
            scale={-0.83}
          />
        </HoverTransform>

        <HoverTransform
          hoverScale={[1.2, 1.2, 1.2]}
          hoverRotation={[0, 0, 0]}
          hoverPosition={[.5, 0, 0]}
          duration={1}
        >
          <mesh
            name="Curve003"
            castShadow
            receiveShadow
            geometry={nodes.Curve003.geometry}
            material={materials['Material.011']}
            position={[-3.008, 5.365, 0.597]}
            rotation={[Math.PI / 2, 0, -1.572]}
            scale={0.784}
          />

          <mesh
            name="Curve006"
            castShadow
            receiveShadow
            geometry={nodes.Curve006.geometry}
            material={materials['Material.013']}
            position={[-2.989, 5.372, 0.58]}
            rotation={[Math.PI / 2, 0, -1.572]}
            scale={0.784}
          />

        </HoverTransform>
        <HoverTransform
          hoverScale={[1.2, 1.2, 1.2]}
          hoverRotation={[0, 0, 0]}
          hoverPosition={[.5, 0, 0]}
          duration={1}
        >
          <mesh
            name="Curve005"
            castShadow
            receiveShadow
            geometry={nodes.Curve005.geometry}
            material={materials['Material.014']}
            position={[-3.029, 4.971, 1.432]}
            rotation={[2.695, 0, -Math.PI / 2]}
            scale={[1.475, 1.5, 1.475]}
          />
        </HoverTransform>
        <HoverTransform
          hoverScale={[1.2, 1.2, 1.2]}
          hoverRotation={[0, 0, 0]}
          hoverPosition={[.5, 0, 0]}
          duration={1}
        >

          <mesh
            name="Curve007"
            castShadow
            receiveShadow
            geometry={nodes.Curve007.geometry}
            material={materials['Material.021']}
            position={[-2.938, 4.386, 2.201]}
            rotation={[Math.PI / 2, 0, -1.553]}
            scale={1.068}
          />
          <mesh
            name="Curve008"
            castShadow
            receiveShadow
            geometry={nodes.Curve008.geometry}
            material={materials['Material.020']}
            position={[-2.938, 4.386, 2.198]}
            rotation={[Math.PI / 2, 0, -1.553]}
            scale={1.068}
          />

          <mesh
            name="Curve009"
            castShadow
            receiveShadow
            geometry={nodes.Curve009.geometry}
            material={materials['Material.019']}
            position={[-2.94, 4.419, 2.289]}
            rotation={[Math.PI / 2, 0, -1.553]}
            scale={1.068}
          />
        </HoverTransform>

        <HoverTransform
          hoverScale={[1.2, 1.2, 1.2]}
          hoverRotation={[0, 0, 0]}
          hoverPosition={[.5, .5, 0]}
          duration={1}
        >
          <mesh
            name="Curve010"
            castShadow
            receiveShadow
            geometry={nodes.Curve010.geometry}
            material={materials['Material.003']}
            position={[-3, 4.027, 1.495]}
            rotation={[Math.PI / 2, 0, -1.462]}
            scale={[0.818, 1.654, 0.803]}
          />

          <mesh
            name="Curve011"
            castShadow
            receiveShadow
            geometry={nodes.Curve011.geometry}
            material={materials['Material.002']}
            position={[-2.967, 3.744, 1.348]}
            rotation={[Math.PI / 2, 0, -1.462]}
            scale={[0.818, 1.654, 0.803]}
          />
        </HoverTransform>


        <HoverTransform
          hoverScale={[1.2, 1.2, 1.2]}
          hoverRotation={[0, 0, 0]}
          hoverPosition={[.5, 0, 0]}
          duration={1}
        >
          <mesh
            name="Curve013"
            castShadow
            receiveShadow
            geometry={nodes.Curve013.geometry}
            material={materials['Material.015']}
            position={[-3.002, 4.865, 0.117]}
            rotation={[Math.PI / 2, 0, -1.653]}
            scale={[1.413, 1.874, 1.413]}
          />

          <mesh
            name="Curve015"
            castShadow
            receiveShadow
            geometry={nodes.Curve015.geometry}
            material={materials['Material.016']}
            position={[-3.019, 4.721, -0.068]}
            rotation={[Math.PI / 2, 0, -1.548]}
            scale={[1.136, 1.508, 1.136]}
          />
        </HoverTransform>

        <HoverTransform
          hoverScale={[1.2, 1.2, 1.2]}
          hoverRotation={[0, 0, 0]}
          hoverPosition={[.5, 0, 0]}
          duration={1}
        >
          <mesh
            name="Curve012"
            castShadow
            receiveShadow
            geometry={nodes.Curve012.geometry}
            material={materials['Material.017']}
            position={[-2.943, 4.498, 0.63]}
            rotation={[Math.PI / 2, 0, -Math.PI / 2]}
            scale={[0.716, 1.284, 0.716]}
          />
          <mesh
            name="Curve016"
            castShadow
            receiveShadow
            geometry={nodes.Curve016.geometry}
            material={materials['Material.018']}
            position={[-2.943, 4.498, 0.628]}
            rotation={[Math.PI / 2, 0, -Math.PI / 2]}
            scale={[0.716, 1.284, 0.716]}
          />
        </HoverTransform>


        <HoverTransform
          hoverScale={[1.2, 1.2, 1.2]}
          hoverRotation={[0, 0, 0]}
          hoverPosition={[0, 0, 0]}
          duration={1}
        >
          <mesh
            name="Cylinder004"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder004.geometry}
            material={materials['Material.026']}
            position={[1.965, 3.005, 1.795]}
            rotation={[Math.PI, -1.106, Math.PI]}
            scale={0.145}
          />
        </HoverTransform>

        <mesh
          name="Cube016"
          castShadow
          receiveShadow
          geometry={nodes.Cube016.geometry}
          material={materials.Base}
          position={[1.99, 3.052, 2.29]}
          rotation={[Math.PI, -0.321, Math.PI]}
          scale={[0.101, 0.101, 0.078]}
        />
        <mesh
          name="test"
          castShadow
          receiveShadow
          geometry={nodes.test.geometry}
          material={materials.light}
          position={[1.943, 3.048, 2.19]}
          rotation={[Math.PI / 2, 0, 2.821]}
          scale={[0.135, 0.023, 0.135]}
        />
        <mesh
          name="test001"
          castShadow
          receiveShadow
          geometry={nodes.test001.geometry}
          material={materials['Material.067']}
          position={[1.944, 3.051, 2.177]}
          rotation={[Math.PI / 2, 0, 2.821]}
          scale={[0.11, 0.019, 0.11]}
        />

        <mesh
          name="Cube017"
          castShadow
          receiveShadow
          geometry={nodes.Cube017.geometry}
          material={materials.Base}
          position={[-0.736, 2.985, 2.277]}
          rotation={[-Math.PI, 0.62, -Math.PI]}
          scale={[0.101, 0.101, 0.078]}
        />

        <mesh
          name="test002"
          castShadow
          receiveShadow
          geometry={nodes.test002.geometry}
          material={materials.light}
          position={[-0.682, 2.981, 2.181]}
          rotation={[Math.PI / 2, 0, -2.521]}
          scale={[0.135, 0.023, 0.135]}
        />
        <mesh
          name="test003"
          castShadow
          receiveShadow
          geometry={nodes.test003.geometry}
          material={materials['Material.067']}
          position={[-0.671, 2.984, 2.173]}
          rotation={[Math.PI / 2, 0, -2.521]}
          scale={[0.11, 0.019, 0.11]}
        />

        <mesh
          name="Cylinder015"
          castShadow
          receiveShadow
          geometry={nodes.Cylinder015.geometry}
          material={materials.Base}
          position={[-3.005, 4.014, 1.382]}
          rotation={[-0.055, 0, -Math.PI / 2]}
          scale={[0.605, 0.23, 0.605]}
        />
        <mesh
          name="Cube020"
          castShadow
          receiveShadow
          geometry={nodes.Cube020.geometry}
          material={materials['Material.032']}
          position={[-1.593, 3.367, 1.297]}
          rotation={[-Math.PI, 0.485, -Math.PI]}
          scale={[0.333, 0.08, 0.08]}
        />
        <mesh
          name="fan"
          castShadow
          receiveShadow
          geometry={nodes.fan.geometry}
          material={materials['Material.030']}
          position={[-1.523, 3.363, 1.115]}
          rotation={[-Math.PI, 0.485, -Math.PI]}
          scale={[0.185, 0.062, 0.023]}
        />
        <mesh
          name="Cube024"
          castShadow
          receiveShadow
          geometry={nodes.Cube024.geometry}
          material={materials['Material.061']}
          position={[-1.639, 3.476, -1.91]}
          rotation={[-1.505, 1.211, 1.5]}
          scale={[0.223, 0.223, 0.17]}
        />
        <mesh
          name="Plane005"
          castShadow
          receiveShadow
          geometry={nodes.Plane005.geometry}
          material={materials.lambert2}
          position={[-2.877, 6.49, -3.535]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane008"
          castShadow
          receiveShadow
          geometry={nodes.Plane008.geometry}
          material={nodes.Plane008.material}
          position={[-2.424, 6.475, -3.801]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane011"
          castShadow
          receiveShadow
          geometry={nodes.Plane011.geometry}
          material={materials['Material.002']}
          position={[-2.864, 6.477, -3.292]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane012"
          castShadow
          receiveShadow
          geometry={nodes.Plane012.geometry}
          material={nodes.Plane012.material}
          position={[-2.424, 6.475, -3.801]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane013"
          castShadow
          receiveShadow
          geometry={nodes.Plane013.geometry}
          material={materials.Circle6__0}
          position={[-2.85, 6.463, -3.049]}
          rotation={[2.861, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane016"
          castShadow
          receiveShadow
          geometry={nodes.Plane016.geometry}
          material={nodes.Plane016.material}
          position={[-2.929, 6.51, -3.047]}
          rotation={[2.861, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane017"
          castShadow
          receiveShadow
          geometry={nodes.Plane017.geometry}
          material={materials.Base}
          position={[-2.836, 6.448, -2.804]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane020"
          castShadow
          receiveShadow
          geometry={nodes.Plane020.geometry}
          material={nodes.Plane020.material}
          position={[-2.424, 6.397, -3.801]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane021"
          castShadow
          receiveShadow
          geometry={nodes.Plane021.geometry}
          material={materials['Material.004']}
          position={[-2.822, 6.472, -2.544]}
          rotation={[-3.046, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane024"
          castShadow
          receiveShadow
          geometry={nodes.Plane024.geometry}
          material={nodes.Plane024.material}
          position={[-2.424, 6.625, -3.781]}
          rotation={[-3.046, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane025"
          castShadow
          receiveShadow
          geometry={nodes.Plane025.geometry}
          material={materials.ctr_gumh001_hitemalpha_1Material}
          position={[-2.808, 6.448, -2.317]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane028"
          castShadow
          receiveShadow
          geometry={nodes.Plane028.geometry}
          material={nodes.Plane028.material}
          position={[-2.424, 6.387, -3.801]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane031"
          castShadow
          receiveShadow
          geometry={nodes.Plane031.geometry}
          material={materials.blinn1SG}
          position={[-2.794, 6.484, -2.073]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane032"
          castShadow
          receiveShadow
          geometry={nodes.Plane032.geometry}
          material={nodes.Plane032.material}
          position={[-2.424, 6.396, -3.801]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane033"
          castShadow
          receiveShadow
          geometry={nodes.Plane033.geometry}
          material={materials['Material.005']}
          position={[-2.78, 6.477, -1.829]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane036"
          castShadow
          receiveShadow
          geometry={nodes.Plane036.geometry}
          material={nodes.Plane036.material}
          position={[-2.424, 6.378, -3.801]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane037"
          castShadow
          receiveShadow
          geometry={nodes.Plane037.geometry}
          material={materials['Material.032']}
          position={[-2.767, 6.488, -1.586]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane040"
          castShadow
          receiveShadow
          geometry={nodes.Plane040.geometry}
          material={nodes.Plane040.material}
          position={[-2.424, 6.376, -3.801]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane041"
          castShadow
          receiveShadow
          geometry={nodes.Plane041.geometry}
          material={materials.azul}
          position={[-2.753, 6.495, -1.342]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane044"
          castShadow
          receiveShadow
          geometry={nodes.Plane044.geometry}
          material={nodes.Plane044.material}
          position={[-2.424, 6.371, -3.801]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane045"
          castShadow
          receiveShadow
          geometry={nodes.Plane045.geometry}
          material={materials['Material.006']}
          position={[-2.739, 6.488, -1.098]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane048"
          castShadow
          receiveShadow
          geometry={nodes.Plane048.geometry}
          material={nodes.Plane048.material}
          position={[-2.424, 6.352, -3.801]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane049"
          castShadow
          receiveShadow
          geometry={nodes.Plane049.geometry}
          material={materials['Material.034']}
          position={[-2.725, 6.45, -0.855]}
          rotation={[2.906, -0.057, 1.555]}
          scale={[0.318, 0.359, 0.08]}
        />
        <mesh
          name="Plane052"
          castShadow
          receiveShadow
          geometry={nodes.Plane052.geometry}
          material={nodes.Plane052.material}
          position={[-2.804, 6.446, -0.854]}
          rotation={[2.906, -0.057, 1.555]}
          scale={[0.318, 0.359, 0.08]}
        />
        <group
          name="Sketchfab_model003"
          position={[-1.733, 2.926, 0.194]}
          rotation={[-Math.PI / 2, 0, 0.401]}
          scale={0.178}>
          <group name="Cubeobjcleanermaterialmergergles">
            <mesh
              name="Object_2002"
              castShadow
              receiveShadow
              geometry={nodes.Object_2002.geometry}
              material={materials.Base}
            />
            <mesh
              name="Object_3001"
              castShadow
              receiveShadow
              geometry={nodes.Object_3001.geometry}
              material={materials['Material.028']}
            />
            <mesh
              name="Object_4002"
              castShadow
              receiveShadow
              geometry={nodes.Object_4002.geometry}
              material={materials.Rojo}
            />
            <mesh
              name="Object_5"
              castShadow
              receiveShadow
              geometry={nodes.Object_5.geometry}
              material={nodes.Object_5.material}
            />
            <mesh
              name="Object_6001"
              castShadow
              receiveShadow
              geometry={nodes.Object_6001.geometry}
              material={nodes.Object_6001.material}
            />
            <mesh
              name="Object_7001"
              castShadow
              receiveShadow
              geometry={nodes.Object_7001.geometry}
              material={materials.naranja}
            />
            <mesh
              name="Object_8001"
              castShadow
              receiveShadow
              geometry={nodes.Object_8001.geometry}
              material={materials.verde}
            />
          </group>
        </group>
        <mesh
          name="Plane001"
          castShadow
          receiveShadow
          geometry={nodes.Plane001.geometry}
          material={nodes.Plane001.material}
          position={[-2.739, 6.488, -1.098]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane003"
          castShadow
          receiveShadow
          geometry={nodes.Plane003.geometry}
          material={nodes.Plane003.material}
          position={[-2.424, 6.371, -3.801]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane004"
          castShadow
          receiveShadow
          geometry={nodes.Plane004.geometry}
          material={nodes.Plane004.material}
          position={[-1.852, 2.828, -0.296]}
          rotation={[-1.546, 0.132, 3.097]}
          scale={[0.383, 0.242, 0.051]}
        />
        <mesh
          name="Plane006"
          castShadow
          receiveShadow
          geometry={nodes.Plane006.geometry}
          material={materials['Material.035']}
          position={[-1.845, 2.826, -0.35]}
          rotation={[-1.546, 0.132, 3.097]}
          scale={[0.383, 0.242, 0.051]}
        />
        <group name="GLTF_SceneRootNode002" position={[2.501, 2.593, 2.248]}>
          <group
            name="Cylinder008_8001"
            position={[0.018, 0.495, -0.08]}
            rotation={[-0.176, -0.032, 0.078]}
          />
        </group>
        <group name="GLTF_SceneRootNode003" position={[2.501, 2.593, 2.248]}>
          <group
            name="Cylinder008_8002"
            position={[0.018, 0.495, -0.08]}
            rotation={[-0.176, -0.032, 0.078]}
          />
        </group>
        <group
          name="Sketchfab_model004"
          position={[0, -13.221, -1.294]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={0.163}>
          <group name="718cfe4bf2d546d1aba2b17f49e24f91objcleanermaterialmergergles">
            <group
              name="Object_2003"
              position={[3.096, -7.711, 93.015]}
              rotation={[0, 0, 0.862]}
              scale={0.182}>
              <mesh
                name="Object_0004"
                castShadow
                receiveShadow
                geometry={nodes.Object_0004.geometry}
                material={materials['Material.068']}
              />
              <mesh
                name="Object_0004_1"
                castShadow
                receiveShadow
                geometry={nodes.Object_0004_1.geometry}
                material={materials['Material.041']}
              />
            </group>
          </group>
        </group>

        <mesh
          name="Sphere"
          castShadow
          receiveShadow
          geometry={nodes.Sphere.geometry}
          material={materials['Material.071']}
          position={[2.538, 1.368, -2.949]}
          scale={0.381}
          onClick={() => {
            const action = actionsRef.current["football_jump"]
            if (action) {
              action.reset()
              action.time = 0
              action.play()
              setTimeout(() => action.stop(), 450)
            }
            const audio = new Audio('/ball_pounce.mp3')
            audio.play()
          }}
        />
        <group
          name="Sketchfab_model006"
          position={[2.475, 1.38, -2.404]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={0.683}>
          <group name="SleepiingCatobjcleanermaterialmergergles">
            <mesh
              name="Object_2004"
              castShadow
              receiveShadow
              geometry={nodes.Object_2004.geometry}
              material={materials['Material.034']}
              position={[0.839, -3.363, -0.465]}
              rotation={[0, 0, 1.089]}
            />
          </group>
        </group>
        <group
          name="Sketchfab_model005"
          position={[0.513, 5.305, 3.545]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={0.995}>
          <group name="root002">
            <group name="GLTF_SceneRootNode004" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Vert_1" rotation={[0, 0, 0.008]} scale={[1, 1, 1.349]}>
                <group
                  name="Object_4003"
                  position={[-0.11, -0.01, 0.059]}
                  rotation={[-Math.PI, 0, -3.125]}
                  scale={1.092}>
                  <mesh
                    name="Object_02414"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_02414.geometry}
                    material={materials['Material.053']}
                  />
                  <mesh
                    name="Object_02414_1"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_02414_1.geometry}
                    material={materials['Material.046']}
                  />
                </group>
              </group>
            </group>
          </group>
        </group>
        <mesh
          name="Plane007"
          castShadow
          receiveShadow
          geometry={nodes.Plane007.geometry}
          material={materials['Material.037']}
          position={[-2.963, 9.598, -5.891]}
          rotation={[-Math.PI, -0.005, -Math.PI / 2]}
          scale={0.417}
        />
        <mesh
          name="Plane009"
          castShadow
          receiveShadow
          geometry={nodes.Plane009.geometry}
          material={materials.light}
          position={[-2.963, 8.328, -5.891]}
          rotation={[-Math.PI, -0.005, -Math.PI / 2]}
          scale={0.317}
        />
        <mesh
          name="Plane010"
          castShadow
          receiveShadow
          geometry={nodes.Plane010.geometry}
          material={materials['Material.001']}
          position={[-2.969, 8.912, -6.98]}
          rotation={[-Math.PI, -0.005, -Math.PI / 2]}
          scale={0.344}
        />
        <mesh
          name="Plane014"
          castShadow
          receiveShadow
          geometry={nodes.Plane014.geometry}
          material={materials['Material.039']}
          position={[6.412, 9.009, 3.437]}
          rotation={[-Math.PI / 2, -1.571, 0]}
          scale={0.332}
        />

        <mesh
          name="Plane018"
          castShadow
          receiveShadow
          geometry={nodes.Plane018.geometry}
          material={materials.light}
          position={[-2.979, 2.907, -5.886]}
          rotation={[-Math.PI, -0.132, -Math.PI / 2]}
          scale={0.457}
        />
        <mesh
          name="Plane019"
          castShadow
          receiveShadow
          geometry={nodes.Plane019.geometry}
          material={materials['Material.001']}
          position={[-2.979, 1.517, -5.886]}
          rotation={[-Math.PI, -0.132, -Math.PI / 2]}
          scale={0.347}
        />
        <mesh
          name="Plane022"
          castShadow
          receiveShadow
          geometry={nodes.Plane022.geometry}
          material={materials['Material.027']}
          position={[-3.136, 2.156, -7.069]}
          rotation={[-Math.PI, -0.132, -Math.PI / 2]}
          scale={0.377}
        />
        <mesh
          name="Plane023"
          castShadow
          receiveShadow
          geometry={nodes.Plane023.geometry}
          material={materials['Material.027']}
          position={[-2.954, 8.912, -4.888]}
          rotation={[-Math.PI, 0, -Math.PI / 2]}
          scale={0.344}
        />
        <group
          name="Sketchfab_model007"
          position={[-1.367, 7.628, 0.193]}
          rotation={[-Math.PI / 2, 0, 1.829]}
          scale={0.981}>
          <group name="mail_iconobjcleanermaterialmergergles">
            <group
              name="Object_3002"
              position={[1.934, 1.409, -2.809]}
              rotation={[-0.411, 0.105, -0.25]}
              onClick={() => window.location.href = "mailto:saadhesham626@gmail.com"}
              scale={0.206}>

              <HoverTransform
                hoverScale={[1.2, 1.2, 1.2]}
                hoverRotation={[0.2, 0, 0]}
                hoverPosition={[0, 0, .7]}
                duration={1}
                onPointerEnter={() => {
                  document.body.style.cursor = "pointer";
                }}
                onPointerLeave={() => {
                  document.body.style.cursor = "default";
                }}

              >
                <mesh
                  name="Object_1003"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_1003.geometry}
                  material={materials['Material.055']}
                />
                <mesh
                  name="Object_1003_1"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_1003_1.geometry}
                  material={materials['Material.056']}
                />
              </HoverTransform>
            </group>
          </group>
        </group>
        <mesh
          name="Plane026"
          castShadow
          receiveShadow
          geometry={nodes.Plane026.geometry}
          material={materials['Material.069']}
          position={[0.484, 3.999, 2.534]}
          rotation={[Math.PI / 2, 0, Math.PI]}
          scale={[1.795, 1.551, 0.825]}
        >  <meshStandardMaterial map={textures[index]} /></mesh>

        {isWorksMode && !isAnimating && (
          <Html position={[0, 0, 0]} center>
            <h2 style={{
              color: 'white',
              fontSize: windowWidth < 768 ? '1.5rem' : '2rem',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              margin: 0,
              minWidth: "10rem",
            }}>
              {worksTitles[index]}
            </h2>
          </Html>
        )}
        {isWorksMode && !isAnimating && worksUrls[index] && (
          <Html position={[0.484, 3.4, 2.534]} center>
            <button
              onClick={() => window.open(worksUrls[index], '_blank')}
              style={{
                padding: windowWidth < 768 ? '0.8rem 1.5rem' : '1rem 2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: windowWidth < 768 ? '1.2rem' : '1.85rem',
                fontWeight: 600,
                minWidth: windowWidth < 768 ? '10rem' : '15rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              View Live
            </button>
          </Html>
        )}
        {isWorksMode && !isAnimating && (
          <>
            <Html position={[1.9, 3.999, 2.534]} center>

              <button
                onClick={() => setIndex((i) => (i - 1 + textures.length) % textures.length)}
                style={{
                  padding: windowWidth < 768 ? '0.8rem' : '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: windowWidth < 768 ? '1.5rem' : '2rem',
                  fontWeight: 600,
                  width: windowWidth < 768 ? '50px' : '60px',
                  height: windowWidth < 768 ? '50px' : '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease',
                }}
              >
                ‹
              </button>
            </Html>
            <Html position={[-1, 3.999, 2.534]} center>
              <button
                onClick={() => setIndex((i) => (i + 1) % textures.length)}
                style={{
                  padding: windowWidth < 768 ? '0.8rem' : '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: windowWidth < 768 ? '1.5rem' : '2rem',
                  fontWeight: 600,
                  width: windowWidth < 768 ? '50px' : '60px',
                  height: windowWidth < 768 ? '50px' : '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease',
                }}
              >
                ›
              </button>
            </Html>
          </>
        )}
        <mesh
          name="Plane027"
          castShadow
          receiveShadow
          geometry={nodes.Plane027.geometry}
          material={materials['Material.070']}
          position={[-1.479, 3.545, -1.888]}
          rotation={[1.595, 0.422, -1.482]}
          scale={[1, 0.968, 0.666]}
        />
        <mesh
          name="Cube025"
          castShadow
          receiveShadow
          geometry={nodes.Cube025.geometry}
          material={materials.light}
          position={[2.908, 3.921, 2.879]}
          scale={[0.383, 1.282, 0.14]}
        />
        <mesh
          name="Cube026"
          castShadow
          receiveShadow
          geometry={nodes.Cube026.geometry}
          material={materials.Base}
          position={[-2.206, 3.921, 3.006]}
          rotation={[0, 0, -Math.PI]}
          scale={[-0.228, -1.282, -0.092]}
        />

        <mesh
          name="Plane029"
          castShadow
          receiveShadow
          geometry={nodes.Plane029.geometry}
          material={materials['Material.066']}
          position={[-2.915, 6.477, -3.779]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />
        <mesh
          name="Plane034"
          castShadow
          receiveShadow
          geometry={nodes.Plane034.geometry}
          material={nodes.Plane034.material}
          position={[-2.915, 6.477, -3.779]}
          rotation={[3.092, -0.057, 1.555]}
          scale={[0.319, 0.359, 0.082]}
        />

        <mesh
          name="Cube028"
          castShadow
          receiveShadow
          geometry={nodes.Cube028.geometry}
          material={materials.light}
          position={[2.703, 3.045, 1.876]}
          rotation={[-Math.PI, 0, 0]}
          scale={[0.034, 0.297, 0.03]}
        />
        <group
          name="Sketchfab_model008"
          position={[-3.083, 1.705, -8.505]}
          rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root001">
            <group name="GLTF_SceneRootNode001" rotation={[Math.PI / 2, 0, 0]}>
              <group
                name="Curve012_0"
                position={[-0.055, 2.945, 6.336]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={28.364}>
                <group
                  name="Object_4004"
                  position={[0.003, -0.007, -0.008]}
                  rotation={[0.011, 0.37, -1.539]}
                  scale={0.825}
                  onClick={() => window.open("https://github.com/Saad-Hisham", "_blank")}
                >
                  <HoverTransform
                    hoverScale={[1.2, 1.2, 1.2]}
                    hoverRotation={[.3, 0, 0]}
                    hoverPosition={[0, 0, 0]}
                    duration={1}
                    onPointerEnter={() => {
                      document.body.style.cursor = "pointer";
                    }}
                    onPointerLeave={() => {
                      document.body.style.cursor = "default";
                    }}

                  >
                    <mesh
                      name="Object_0005"
                      castShadow
                      receiveShadow
                      geometry={nodes.Object_0005.geometry}
                      material={materials.glossy_putih}
                      onPointerEnter={() => { }}
                    />

                    <mesh
                      name="Object_0005_1"
                      castShadow
                      receiveShadow
                      geometry={nodes.Object_0005_1.geometry}
                      material={nodes.Object_0005_1.material}
                    />
                  </HoverTransform>
                </group>
              </group>
            </group>
          </group>
        </group>
        <HoverTransform
          hoverScale={[1.2, 1.2, 1.2]}
          hoverRotation={[0, 0, 0]}
          hoverPosition={[.1, .1, 0]}
          duration={1}
          onPointerEnter={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerLeave={() => {
            document.body.style.cursor = "default";
          }}

        >

          <group
            name="Sketchfab_model009"
            position={[-3.256, 4.82, -3.555]}
            rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            scale={[0.313, 1.06, 0.313]}>
            <group name="root003">
              <group name="GLTF_SceneRootNode005" rotation={[Math.PI / 2, 0, 0]}>
                <group
                  name="Cube_0"
                  position={[0, 0, 0.121]}
                  rotation={[0, 0, -Math.PI]}
                  scale={[-1.026, -1.088, -0.074]}>
                  <group name="Object_4005" position={[-0.167, 0.085, 0]} scale={1.138}
                    onClick={() => window.open("https://www.linkedin.com/in/saad-hesham-620a70232/", "_blank")}>
                    <mesh
                      name="Object_0007"
                      castShadow
                      receiveShadow
                      geometry={nodes.Object_0007.geometry}
                      material={materials['Material.072']}
                    />
                    <mesh
                      name="Object_0007_1"
                      castShadow
                      receiveShadow
                      geometry={nodes.Object_0007_1.geometry}
                      material={materials['Material.073']}
                    />

                  </group>
                </group>
                <group
                  name="Text001_5"
                  position={[-0.778, -0.7, 0.243]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={[2.334, 0.788, 2.334]}
                />
              </group>
            </group>
          </group>
        </HoverTransform>



        <mesh
          name="Plane002"
          castShadow
          receiveShadow
          geometry={nodes.Plane002.geometry}
          material={materials['Material.052']}
          position={[3.088, 1.029, -0.233]}
          scale={1.186}
        />

        <mesh
          name="Plane030"
          castShadow
          receiveShadow
          geometry={nodes.Plane030.geometry}
          material={materials['Material.074']}
          position={[0.854, 1.005, -0.326]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[3.864, 2.502, 3.807]}
        />
        <mesh
          name="Cylinder005"
          castShadow
          receiveShadow
          geometry={nodes.Cylinder005.geometry}
          material={materials['Material.075']}
          position={[-2.756, 1.303, -1.932]}
          rotation={[0, 1.547, Math.PI / 2]}
          scale={[-0.052, -0.351, -0.052]}
        />
        <mesh
          name="Cylinder006"
          castShadow
          receiveShadow
          geometry={nodes.Cylinder006.geometry}
          material={materials['Material.075']}
          position={[-2.127, 1.303, -2.11]}
          rotation={[-Math.PI, 1.127, -Math.PI / 2]}
          scale={[-0.052, -0.351, -0.052]}
        />
        <group
          name="Sketchfab_model010"
          position={[2.37, 1.572, 1.189]}
          rotation={[-1.496, -0.075, 1.833]}
          scale={0.286}>
          <group name="Root">
            <group
              name="25_surf0000_1_0_0_root_root_ground003"
              position={[0.269, -0.098, 0.04]}
              scale={16.713}>
              <group
                name="25_surf0000_1_0_0_root_root_ground001"
                position={[-0.111, 0.143, -0.06]}
                rotation={[0.146, -0.061, 0.715]}
                scale={0.737}>
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground001_1"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground001_1'].geometry}
                  material={materials['Material.082']}
                />
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground001_2"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground001_2'].geometry}
                  material={materials['Material.076']}
                />
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground001_3"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground001_3'].geometry}
                  material={materials['Material.077']}
                />
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground001_4"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground001_4'].geometry}
                  material={materials['Material.078']}
                />
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground001_5"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground001_5'].geometry}
                  material={materials['Material.079']}
                />
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground001_6"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground001_6'].geometry}
                  material={materials['Material.080']}
                />
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground001_7"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground001_7'].geometry}
                  material={materials['Material.081']}
                />
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground001_8"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground001_8'].geometry}
                  material={materials['Material.083']}
                />
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground001_9"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground001_9'].geometry}
                  material={materials['Material.084']}
                />
              </group>
              <group
                name="25_surf0000_1_0_0_root_root_ground008"
                position={[-0.111, 0.143, -0.06]}
                rotation={[0.146, -0.061, 0.715]}
                scale={0.737}>
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground007"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground007'].geometry}
                  material={materials['Material.082']}
                />
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground007_1"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground007_1'].geometry}
                  material={materials['Material.076']}
                />
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground007_2"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground007_2'].geometry}
                  material={materials['Material.077']}
                />
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground007_3"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground007_3'].geometry}
                  material={materials['Material.078']}
                />
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground007_4"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground007_4'].geometry}
                  material={materials['Material.079']}
                />
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground007_5"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground007_5'].geometry}
                  material={materials['Material.080']}
                />
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground007_6"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground007_6'].geometry}
                  material={materials['Material.081']}
                />
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground007_7"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground007_7'].geometry}
                  material={materials['Material.083']}
                />
                <mesh
                  name="25_surf0000_1_0_0_root_root_ground007_8"
                  castShadow
                  receiveShadow
                  geometry={nodes['25_surf0000_1_0_0_root_root_ground007_8'].geometry}
                  material={materials['Material.084']}
                />
              </group>
            </group>
            <group name="Lamp" position={[4.076, 1.005, 5.904]} rotation={[-0.268, 0.602, 1.931]}>
              <group name="Lamp001" />
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model011"
          position={[-1.683, 2.717, 2.447]}
          rotation={[-Math.PI / 2, 0, 1.756]}
          scale={0.075}>
          <group name="Figuresfbx001" rotation={[Math.PI / 2, 0, 0]}>
            <group name="RootNode002">

              <group name="Gumi_Figure001" position={[6.305, 0, 0]}>
                <group name="Gumi001">
                  <group name="Gumiobj_1001">
                    <mesh
                      name="Gumiobj_1_test_lambert2_0001"
                      castShadow
                      receiveShadow
                      geometry={nodes.Gumiobj_1_test_lambert2_0001.geometry}
                      material={materials['test_lambert2.001']}
                      position={[0.012, 2.168, 0.143]}
                    />
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
        <mesh
          name="Plane035"
          castShadow
          receiveShadow
          geometry={nodes.Plane035.geometry}
          material={materials['Material.030']}
          position={[-1.437, 3.405, 1.625]}
          rotation={[Math.PI / 2, 0, -1.102]}
          scale={[0.641, 0.814, 0.57]}
        />
        <group
          name="Cube035"
          position={[-1.756, 3.071, 1.583]}
          rotation={[-1.546, 0.047, -2.056]}
          scale={[0.438, 0.173, 0.076]}>
          <mesh
            name="Cube114"
            castShadow
            receiveShadow
            geometry={nodes.Cube114.geometry}
            material={materials.azul}
          />
          <mesh
            name="Cube114_1"
            castShadow
            receiveShadow
            geometry={nodes.Cube114_1.geometry}
            material={materials.Base}
          />
        </group>
        <group
          name="Empty001"
          position={[-1.553, 3.687, 1.17]}
          rotation={[Math.PI, 0.592, 2.972]}
          scale={-0.068}>
          <mesh
            name="Cylinder009"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder009.geometry}
            material={materials.light}
          />
        </group>
        <group
          name="Empty002"
          position={[-1.553, 3.345, 1.17]}
          rotation={[Math.PI, 0.592, 2.972]}
          scale={-0.068}>
          <mesh
            name="Cylinder007"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder007.geometry}
            material={materials.light}
          />
        </group>
        <group
          name="Empty003"
          position={[-1.553, 2.984, 1.17]}
          rotation={[Math.PI, 0.592, 2.972]}
          scale={-0.068}>
          <mesh
            name="Cylinder008"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder008.geometry}
            material={materials.light}
          />
        </group>
        <group
          name="Empty004"
          position={[-1.956, 3.087, 1.922]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={-0.073}>
          <mesh
            name="Cylinder010"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder010.geometry}
            material={materials.light}
          />
        </group>
        <group
          name="Empty005"
          position={[-1.764, 3.115, 1.62]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={-0.073}>
          <mesh
            name="Cylinder011"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder011.geometry}
            material={materials.light}
          />
        </group>
        <group
          name="Empty006"
          position={[-1.624, 3.082, 1.347]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={-0.073}>
          <mesh
            name="Cylinder012"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder012.geometry}
            material={materials.light}
          />
        </group>
        <group
          name="Empty010"
          position={[-1.058, 2.815, 1.765]}
          rotation={[-1.637, -0.128, -0.035]}>
          <group name="Circle011">
            <mesh
              name="Circle009"
              castShadow
              receiveShadow
              geometry={nodes.Circle009.geometry}
              material={materials['Material.051']}
            />
            <mesh
              name="Circle009_1"
              castShadow
              receiveShadow
              geometry={nodes.Circle009_1.geometry}
              material={materials['Material.060']}
            />
            <mesh
              name="Circle009_2"
              castShadow
              receiveShadow
              geometry={nodes.Circle009_2.geometry}
              material={materials['Material.022']}
            />
            <mesh
              name="Circle009_3"
              castShadow
              receiveShadow
              geometry={nodes.Circle009_3.geometry}
              material={materials['Material.057']}
            />
          </group>
        </group>
        <mesh
          name="Cube004"
          castShadow
          receiveShadow
          geometry={nodes.Cube004.geometry}
          material={materials.Base}
          position={[-2.133, 3.439, 1.682]}
          rotation={[Math.PI, -1.058, Math.PI]}
          scale={[-0.173, -0.217, -0.061]}
        />
        <group
          name="Empty012"
          position={[-2.093, 3.448, 1.703]}
          rotation={[-0.008, 1.039, -1.859]}
          scale={[-0.102, -0.095, -0.097]}>
          <mesh
            name="Cylinder014"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder014.geometry}
            material={materials.light}
          />
        </group>
        <group
          name="Sketchfab_model012"
          position={[-2.348, 0.411, -4.55]}
          rotation={[-Math.PI / 2, 0, 1.521]}
          scale={0.043}>
          <group name="3bcd6dbcea8946b59b4ddf259507b6f0fbx" rotation={[Math.PI / 2, 0, 0]}>
            <group name="RootNode003">
              <group name="Box002" position={[1.668, 54.594, 0]} scale={1.139}>
                <group
                  name="Box002_aguion_0"
                  position={[-4.777, -10.964, 4.752]}
                  rotation={[0, 0.644, 0]}
                  scale={0.681}>
                  <mesh
                    name="Box002_aguion_0_1"
                    castShadow
                    receiveShadow
                    geometry={nodes.Box002_aguion_0_1.geometry}
                    material={materials.aguion}
                  />
                  <mesh
                    name="Box002_aguion_0_2"
                    castShadow
                    receiveShadow
                    geometry={nodes.Box002_aguion_0_2.geometry}
                    material={materials.Material_63}
                  />
                  <mesh
                    name="Box002_aguion_0_3"
                    castShadow
                    receiveShadow
                    geometry={nodes.Box002_aguion_0_3.geometry}
                    material={materials.oscuridad_maxima}
                  />
                </group>
              </group>
              <group name="Box003" position={[1.668, 54.594, 0]} scale={1.139} />
            </group>
          </group>
        </group>
        <group name="Root001">
          <group name="Cube018" position={[-0.49, 0.203, 4.3]} rotation={[-0.288, 0.125, -0.398]} />
          <group
            name="Cube019"
            position={[2.086, 2.408, 2.659]}
            rotation={[-2.719, -1.337, 2.92]}
            scale={1.298}
          />
          <group
            name="Cylinder017"
            position={[-0.759, 1.317, 1.456]}
            rotation={[0.276, 0.691, 0.678]}
            scale={[0.09, 0.09, 0.355]}
          />
          <group
            name="Cylinder018"
            position={[0.761, 1.716, 1.834]}
            rotation={[0.761, -0.517, -0.717]}
          />
          <group
            name="Cylinder019"
            position={[1.524, 1.714, 1.027]}
            rotation={[0.578, -0.62, 0.603]}
            scale={[0.09, 0.09, 0.355]}
          />
          <group
            name="Lamp003"
            position={[-4.435, -3.992, 7.895]}
            rotation={[-0.268, 0.602, 1.931]}>
            <group name="Lamp002" />
          </group>
          <group
            name="Torus"
            position={[2.165, 2.417, 2.68]}
            rotation={[-2.622, 0.166, 1.42]}
            scale={0.565}
          />
        </group>
        <group name="Empty009" position={[1.437, 1.734, -2.237]}
          onClick={() => {
            const main = actionsRef.current["Empty.009Action.001"]
            const circle1 = actionsRef.current["CircleAction.001"]
            const circle2 = actionsRef.current["CircleAction.002"]
            const audio = audioRef.current

            if (!main || !circle1 || !circle2 || !audio) return
            if (main.isRunning()) return

            main.reset()
            main.setLoop(THREE.LoopOnce)
            main.clampWhenFinished = true
            main.play()

            circle1.reset()
            circle1.setLoop(THREE.LoopRepeat, Infinity)
            circle1.play()

            circle2.reset()
            circle2.setLoop(THREE.LoopRepeat, Infinity)
            circle2.play()

            audio.currentTime = 0
            audio.play()

            const duration = main.getClip().duration * 1000

            setTimeout(() => {
              audio.pause()
              audio.currentTime = 0

              circle1.stop()
              circle2.stop()
            }, duration)
          }}
        >
          <group
            name="Cylinder013"
            position={[-0.142, -0.399, -0.053]}
            rotation={[1.569, 0, -Math.PI]}
            scale={[-0.036, -0.366, -0.037]}>
            <mesh
              name="Cylinder005_1"
              castShadow
              receiveShadow
              geometry={nodes.Cylinder005_1.geometry}
              material={materials['Material.023']}
            />
            <mesh
              name="Cylinder005_2"
              castShadow
              receiveShadow
              geometry={nodes.Cylinder005_2.geometry}
              material={materials['Base.001']}
            />
            <mesh
              name="Cylinder005_3"
              castShadow
              receiveShadow
              geometry={nodes.Cylinder005_3.geometry}
              material={materials['azul.001']}
            />
            <mesh
              name="Cylinder005_4"
              castShadow
              receiveShadow
              geometry={nodes.Cylinder005_4.geometry}
              material={materials['Material.024']}
            />
          </group>
          <group
            name="Empty007"
            position={[-0.133, -0.425, 0.297]}
            rotation={[0, 0, 0.805]}
            scale={-0.281}>
            <mesh
              name="Circle004"
              castShadow
              receiveShadow
              geometry={nodes.Circle004.geometry}
              material={materials['Material.023']}
              position={[-0.006, 0.022, 3.029]}
              rotation={[-Math.PI / 2, 1.22, -Math.PI]}
            />
          </group>
          <group
            name="Empty008"
            position={[-0.133, -0.387, 0.311]}
            rotation={[0, 0, 0.805]}
            scale={-0.281}>
            <mesh
              name="Circle003"
              castShadow
              receiveShadow
              geometry={nodes.Circle003.geometry}
              material={materials['Material.023']}
              position={[-0.006, 0.022, 0]}
              rotation={[Math.PI / 2, -1.072, 0]}
              scale={0.89}
            />
          </group>
        </group>
        <group
          name="Sketchfab_model013"
          position={[4.924, 2.216, 2.508]}
          rotation={[-Math.PI / 2, 0, 3.078]}
          scale={0.569}
        />
        <group
          name="a45b6f53b9cc462a82863bb5898bf730fbx"
          position={[5.071, 1.84, 2.413]}
          rotation={[-Math.PI, 0.064, -Math.PI]}
          scale={0.006}
        />
        <group
          name="Object_2005"
          position={[5.071, 1.84, 2.413]}
          rotation={[-Math.PI, 0.064, -Math.PI]}
          scale={0.006}
        />
        <group
          name="RootNode004"
          position={[5.071, 1.84, 2.413]}
          rotation={[-Math.PI, 0.064, -Math.PI]}
          scale={0.006}
        />
        <group
          name="Robot_Origin"
          position={[0, 0.615, 0]}
          rotation={[-Math.PI / 2, 0, 3.078]}
          scale={0.569}
        />
        <group
          name="Robot"
          position={[5.071, 1.838, 2.413]}
          rotation={[-Math.PI / 2, 0, 3.078]}
          scale={0.569}
        />
        <group name="Mouth" position={[5.089, 3.273, 2.127]} rotation={[-Math.PI / 2, 0, 3.078]} />
        <group name="Wave" position={[0, 0, 1]} rotation={[-Math.PI / 2, 0, 3.078]} />
        <group
          name="Wave002"
          position={[0, 0, 0.427]}
          rotation={[-Math.PI / 2, 0, 3.078]}
          scale={[1, 1, 0.474]}
        />
        <group
          name="Wave001"
          position={[0, 0, 0.819]}
          rotation={[-Math.PI / 2, 0, 3.078]}
          scale={[1, 1, 0.834]}
        />
        <group
          name="Wave003"
          position={[0, 0, 0.05]}
          rotation={[-Math.PI / 2, 0, 3.078]}
          scale={[1, 1, 0.128]}
        />
        <group name="Ears" position={[5.071, 3.498, 2.413]} scale={0.569} />
        <group
          name="Eyes"
          position={[5.089, 3.438, 2.134]}
          rotation={[-Math.PI / 2, 0, 3.078]}
          scale={0.569}
        />
        <group
          name="hANDS"
          position={[4.822, 1.775, 2.397]}
          rotation={[-1.557, 0.216, 3.076]}
          scale={0.569}
        />
        <group
          name="hANDS002"
          position={[5.32, 1.775, 2.429]}
          rotation={[-1.585, -0.216, -0.065]}
          scale={0.569}
        />
        <mesh
          name="Cube021"
          castShadow
          receiveShadow
          geometry={nodes.Cube021.geometry}
          material={materials['Material.087']}
          position={[6.119, 21.835, -3.223]}
          scale={21.733}
        />
        <HoverTransform
          hoverScale={[1.2, 1.2, 1.2]}
          hoverRotation={[0, 0, 0]}
          hoverPosition={[0, 0, 0]}
          duration={1}
          onPointerEnter={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerLeave={() => {
            document.body.style.cursor = "default";
          }}

        >
          <mesh
            name="Plane038"
            castShadow
            receiveShadow
            geometry={nodes.Plane038.geometry}
            material={materials.Base}
            position={[7.02, 6.611, 3.597]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1.375, 1.473, 0.437]}
            onClick={() =>
              handleSectionClick("about", () =>
                animateCameraTo(
                  { x: -0.617, y: 4.100, z: -1.924 },
                  { x: 0.399, y: 4.667, z: -1.921 },
                  { x: -1.564, y: 1.061, z: 1.563 }
                )
              )
            }
          />
          <mesh
            name="Text002"
            castShadow
            receiveShadow
            geometry={nodes.Text002.geometry}
            material={materials.light}
            position={[7.126, 6.618, 3.412]}
            rotation={[Math.PI / 2, -0.002, Math.PI]}
            scale={0.728}
          />
        </HoverTransform>


        <HoverTransform
          hoverScale={[1.2, 1.2, 1.2]}
          hoverRotation={[0, 0, 0]}
          hoverPosition={[0, 0, 0]}
          duration={1}
          onPointerEnter={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerLeave={() => {
            document.body.style.cursor = "default";
          }}

        >
          <mesh
            name="Plane039"
            castShadow
            receiveShadow
            geometry={nodes.Plane039.geometry}
            material={materials.Base}
            position={[7.02, 5.281, 3.597]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1.375, 1.473, 0.437]}
            onClick={() =>
              handleSectionClick("skills", () =>
                animateCameraTo(
                  { x: -1.139, y: 5.138, z: 1.683 },
                  { x: 2.524, y: 5.865, z: 0.291 },
                  { x: -2.660, y: 1.166, z: 2.694 }
                )
              )
            }
          />
          <mesh
            name="Text001"
            castShadow
            receiveShadow
            geometry={nodes.Text001.geometry}
            material={materials.light}
            position={[7.377, 5.269, 3.385]}
            rotation={[Math.PI / 2, -0.002, -Math.PI]}
            scale={[0.637, 0.637, 0.779]}
          />

        </HoverTransform>


        <HoverTransform
          hoverScale={[1.2, 1.2, 1.2]}
          hoverRotation={[0, 0, 0]}
          hoverPosition={[0, 0, 0]}
          duration={1}
          onPointerEnter={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerLeave={() => {
            document.body.style.cursor = "default";
          }}

        >

          <mesh
            name="Plane042"
            castShadow
            receiveShadow
            geometry={nodes.Plane042.geometry}
            material={materials.Base}
            position={[7.02, 3.927, 3.597]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1.375, 1.473, 0.437]}
            onClick={() =>
              handleSectionClick("works", () => {
                setIsWorksMode(true)
                setIsAnimating(true)
                animateCameraTo(
                  { x: 0.465, y: 4.505, z: 0.069 },
                  { x: 0.465, y: 4.523, z: -0.029 },
                  { x: -2.960, y: 0.000, z: -3.142 },
                  2,
                  "power2.inOut",
                  () => setIsAnimating(false)
                )
              })
            }
          />


          <mesh
            name="Text003"
            castShadow
            receiveShadow
            geometry={nodes.Text003.geometry}
            material={materials.light}
            position={[7.187, 3.926, 3.432]}
            rotation={[Math.PI / 2, -0.002, Math.PI]}
            scale={0.709}
          />
        </HoverTransform>


        <HoverTransform
          hoverScale={[1.2, 1.2, 1.2]}
          hoverRotation={[0, 0, 0]}
          hoverPosition={[0, 0, 0]}
          duration={1}
          onPointerEnter={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerLeave={() => {
            document.body.style.cursor = "default";
          }}

        >
          <mesh
            name="Plane043"
            castShadow
            receiveShadow
            geometry={nodes.Plane043.geometry}
            material={materials.Base}
            position={[7.016, 2.536, 3.588]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1.375, 1.473, 0.437]}
            onClick={() =>
              handleSectionClick("contact", () =>
                animateCameraTo(
                  { x: 1.881, y: 5.913, z: -3.025 },
                  { x: 2.507, y: 6.050, z: -3.042 },
                  { x: -1.692, y: 1.353, z: 1.694 }
                )
              )
            }
          />

          <mesh
            name="Text004"
            castShadow
            receiveShadow
            geometry={nodes.Text004.geometry}
            material={materials.light}
            position={[7.446, 2.541, 3.43]}
            rotation={[Math.PI / 2, -0.002, Math.PI]}
            scale={[0.498, 0.632, 0.692]}
          />
        </HoverTransform>


        <group
          name="Sketchfab_model014"
          position={[5.098, 1.348, 2.59]}
          rotation={[-Math.PI / 2, 0, 2.641]}
          scale={0.698}>
          <group
            name="a45b6f53b9cc462a82863bb5898bf730fbx001"
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.01}>
            <group name="Object_2006">
              <group name="RootNode005">
                <group
                  name="Robot_Origin001"
                  position={[0, 0.615, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  scale={100}>
                  <group name="Ears001" position={[0, 0, 2.967]}>
                    <mesh
                      name="Ears_Black_Matt_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Ears_Black_Matt_0.geometry}
                      material={materials['Black_Matt.001']}
                    />
                  </group>
                  <group name="Empty011" position={[0, -0.06, 2.786]}>
                    <group name="Eyes001" position={[0, -0.431, 0.076]}>
                      <mesh
                        name="Eyes_Blue_Light_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.Eyes_Blue_Light_0.geometry}
                        material={materials['Blue_Light.001']}
                      />
                    </group>
                  </group>
                  <group name="Hand_origin" position={[0.723, 0, 2.015]}>
                    <group name="hANDS001" position={[-0.723, 0, -1.963]}>
                      <mesh
                        name="hANDS_White_Glossy_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.hANDS_White_Glossy_0.geometry}
                        material={materials['White_Glossy.001']}
                      />
                    </group>
                  </group>
                  <group
                    name="Hand_origin002"
                    position={[-0.723, 0, 2.015]}
                    rotation={[0, 0, -Math.PI]}>
                    <group name="hANDS003" position={[-0.723, 0, -1.963]}>
                      <mesh
                        name="hANDS002_White_Glossy_0"
                        castShadow
                        receiveShadow
                        geometry={nodes.hANDS002_White_Glossy_0.geometry}
                        material={materials['White_Glossy.001']}
                      />
                    </group>
                  </group>
                  <group name="Mouth001" position={[0, -0.504, 2.573]}>
                    <mesh
                      name="Mouth_Blue_Light_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Mouth_Blue_Light_0.geometry}
                      material={materials['Blue_Light.001']}
                    />
                  </group>
                  <group name="Robot001" position={[0, 0, 0.051]}>
                    <mesh
                      name="Robot_Black_Matt_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Robot_Black_Matt_0.geometry}
                      material={materials['Black_Matt.001']}
                    />
                    <mesh
                      name="Robot_Blue_Light_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Robot_Blue_Light_0.geometry}
                      material={materials['Blue_Light.001']}
                    />
                    <mesh
                      name="Robot_White_Glossy_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Robot_White_Glossy_0.geometry}
                      material={materials['White_Glossy.001']}
                    />
                  </group>
                  <group name="Wave004" position={[0, 0, 1]}>
                    <mesh
                      name="Wave_Blue_Light_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Wave_Blue_Light_0.geometry}
                      material={materials['Blue_Light.001']}
                    />
                  </group>
                  <group name="Wave005" position={[0, 0, 0.427]} scale={[1, 1, 0.474]}>
                    <mesh
                      name="Wave002_Blue_Light_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Wave002_Blue_Light_0.geometry}
                      material={materials['Blue_Light.001']}
                    />
                  </group>
                  <group name="Wave006" position={[0, 0, 0.819]} scale={[1, 1, 0.834]}>
                    <mesh
                      name="Wave001_Blue_Light_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Wave001_Blue_Light_0.geometry}
                      material={materials['Blue_Light.001']}
                    />
                  </group>
                  <group name="Wave007" position={[0, 0, 0.05]} scale={[1, 1, 0.128]}>
                    <mesh
                      name="Wave003_Blue_Light_0"
                      castShadow
                      receiveShadow
                      geometry={nodes.Wave003_Blue_Light_0.geometry}
                      material={materials['Blue_Light.001']}
                    />
                  </group>
                  <group name="Waves" position={[0, 0, 1]} scale={[1, 1, 0.747]} />
                </group>
              </group>
            </group>
          </group>
        </group>
        <mesh
          name="GamingClutter_018"
          castShadow
          receiveShadow
          geometry={nodes.GamingClutter_018.geometry}
          material={nodes.GamingClutter_018.material}
          position={[-0.997, 0.129, -0.147]}
          rotation={[0.065, 0.213, 0.128]}
          scale={[0.8, 1.126, 1.034]}
        />
        <mesh
          name="GamingClutter_005001"
          castShadow
          receiveShadow
          geometry={nodes.GamingClutter_005001.geometry}
          material={nodes.GamingClutter_005001.material}
          position={[-0.207, 0.098, 0.086]}
          rotation={[-2.836, 0.823, 2.7]}
          scale={[0.926, 0.827, 0.772]}
        />
        <mesh
          name="GamingClutter_035001"
          castShadow
          receiveShadow
          geometry={nodes.GamingClutter_035001.geometry}
          material={nodes.GamingClutter_035001.material}
          position={[0.215, 0.122, -0.733]}
          rotation={[-0.214, -1.013, -0.083]}
          scale={[1.137, 0.655, 1.039]}
        />
        <mesh
          name="Cube022"
          castShadow
          receiveShadow
          geometry={nodes.Cube022.geometry}
          material={materials.light}
          position={[-2.28, 3.963, 2.927]}
          scale={[0.383, 1.282, 0.14]}
        />
        <mesh
          name="download_button"
          castShadow
          receiveShadow
          geometry={nodes.download_button.geometry}
          material={materials['Material.036']}
          position={[-1.479, 3.195, -1.894]}
          rotation={[-3.14, 0.029, -1.926]}
          scale={[-0.118, -0.438, -0.62]}
          onClick={handleDownloadClick}
          onPointerEnter={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerLeave={() => {
            document.body.style.cursor = "default";
          }}
        />

      </group>
      </group>
    
    </>
  )
}

useGLTF.preload('/room.glb', true)
export default Room;
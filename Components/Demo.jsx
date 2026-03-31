import React, { useRef, useState, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

const Demo = (props) => {
  const group = useRef()
  const { nodes, animations } = useGLTF('/Demo.glb')
  const { actions } = useAnimations(animations, group)
  const [playingForward, setPlayingForward] = useState(false)

  useEffect(() => {
    if (animations && animations.length > 0) {
      const action = actions[animations[0].name]
      if (action) {
        action.clampWhenFinished = true
        action.setLoop(THREE.LoopOnce)
      }
    }
  }, [actions, animations])

  const handleClick = (e) => {
    e.stopPropagation()
    if (animations && animations.length > 0) {
      const action = actions[animations[0].name]
      if (action) {
        action.paused = false
        if (!playingForward) {
          action.timeScale = 1
          action.play()
          setPlayingForward(true)
        } else {
          action.timeScale = -1
          action.play()
          setPlayingForward(false)
        }
      }
    }
  }

  return (
    <group ref={group} {...props} dispose={null} onClick={handleClick}>
      <primitive object={nodes.Scene} />
    </group>
  )
}

useGLTF.preload('/Demo.glb')

export default Demo

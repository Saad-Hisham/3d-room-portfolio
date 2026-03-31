import React, { useRef, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

const Boy = (props) => {
  const group = useRef()
  const { nodes, animations } = useGLTF('/boy.glb')
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    // Play the first animation if it exists
    if (animations.length > 0) {
      const firstAction = actions[animations[0].name]
      if (firstAction) {
        firstAction.reset().fadeIn(0.5).play()
      }
    }
  }, [actions, animations])

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={nodes.Scene} />
    </group>
  )
}

useGLTF.preload('/boy.glb')

export default Boy

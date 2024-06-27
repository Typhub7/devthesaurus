import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { transformData } from './utils/transformData';
import { addLights } from './utils/lights';
import { createNodes } from './utils/createNodes';
import { createEdges } from './utils/createEdges';
//import { animateCameraTo } from './utils/animateCamera';
//import { handleMouseClick } from './utils/handleEvents';
import TWEEN from '@tweenjs/tween.js';
import termsData from './data/terms.json';
import './Graph.css';

const Graph = () => {
  const mountRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.5;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Ajout des lumières :
    addLights(scene)

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const elements = transformData(termsData);

    const getColorByLevel = (level) => {
      switch (level) {
        case 0: return 0xc9b037;
        case 1: return 0xb4b4b4;
        case 2: return 0xad8a56;
        default: return 0xffffff;
      }
    };

    const loader = new FontLoader();

    const { groups, rectangles } = createNodes(elements, scene);
    createEdges(elements, scene);


    const onDocumentMouseClick = (event) => {
      event.preventDefault();
      const rect = mount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(rectangles);

      if (intersects.length > 0) {
        const intersected = intersects[0].object;
        setSelectedNode(intersected.userData);
        animateCameraTo(intersected.parent.position, 10); // Transition vers le rectangle cliqué avec une distance de zoom de 10
      }
    };

    // Animation pour s'éloigner de l'objet actuel
    const animateCameraTo = (targetPosition, zoomDistance) => {
      const startPosition = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
      };
    
      // Calculer la position intermédiaire en s'éloignant de l'objet actuel
      const intermediatePosition = {
        x: startPosition.x,
        y: startPosition.y,
        z: startPosition.z + zoomDistance
      };
    
      // Calculer la position cible en ajoutant la distance de zoom au nouvel élément
      const target = {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z + zoomDistance
      };
    
      const startRotation = {
        x: camera.rotation.x,
        y: camera.rotation.y,
        z: camera.rotation.z
      };
    
      camera.lookAt(new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z));
      const endRotation = {
        x: camera.rotation.x,
        y: camera.rotation.y,
        z: camera.rotation.z
      };
      camera.rotation.set(startRotation.x, startRotation.y, startRotation.z);
    
      const tweenAway = new TWEEN.Tween(startPosition)
        .to(intermediatePosition, 1500) // Durée de la première étape de l'animation en ms
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          camera.position.set(startPosition.x, startPosition.y, startPosition.z);
          controls.update();
        })
        .onComplete(() => {
          const tweenToTarget = new TWEEN.Tween(intermediatePosition)
            .to(target, 1500) // Durée de la deuxième étape de l'animation en ms
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
              camera.position.set(intermediatePosition.x, intermediatePosition.y, intermediatePosition.z);
              controls.target.set(targetPosition.x, targetPosition.y, targetPosition.z);
              controls.update();
            })
            .start();
    
          const rotationTween = new TWEEN.Tween(startRotation)
            .to(endRotation, 1000) // Durée de l'animation en ms
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
              camera.rotation.set(startRotation.x, startRotation.y, startRotation.z);
            })
            .start();
        })
        .start();
    };

    mount.addEventListener('click', onDocumentMouseClick, false);

    const animate = () => {
      requestAnimationFrame(animate);
      TWEEN.update();
      groups.forEach(group => {
        group.lookAt(camera.position); // Fait pivoter les groupes pour faire face à la caméra
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mount.removeEventListener('click', onDocumentMouseClick);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="flex">
      <div ref={mountRef} className="w-3/4 h-screen"></div>
      {selectedNode && (
        <div className="w-1/4 h-screen bg-gray-100 p-4 overflow-auto">
          <h2>{selectedNode.label}</h2>
          <p>{selectedNode.description}</p>
          {selectedNode.link && <a href={selectedNode.link} target="_blank" rel="noopener noreferrer">More Info</a>}
        </div>
      )}
    </div>
  );
};

export default Graph;
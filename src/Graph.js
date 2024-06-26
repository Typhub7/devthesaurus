import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { transformData } from './utils/transformData';
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

    // Ajout des lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 50000); // Lumière ambiante faible
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 50000);
    directionalLight.position.set(0.5, 0.5, 0.5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 50000);
    pointLight.position.set(-1, -1, -1);
    scene.add(pointLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 50000);
    hemiLight.position.set(0, 1, 0);
    scene.add(hemiLight);
    
    // Lumière directionnelle supplémentaire 1 fixe pour les étiquettes
    const labelLight = new THREE.DirectionalLight(0xffffff, 25000);
    labelLight.position.set(0, 0, -5);
    scene.add(labelLight);

    // Lumière directionnelle supplémentaire 2 fixe pour les étiquettes
    const labelLightTwo= new THREE.DirectionalLight(0xffffff,35000);
    labelLightTwo.position.set(0, -5, 0);
    scene.add(labelLightTwo);

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

    const groups = [];
    const rectangles = [];

    elements.nodes.forEach(node => {
      const width = 0.15;
      const height = 0.9;
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0, width);
      shape.lineTo(height, width);
      shape.lineTo(height, 0);
      shape.lineTo(0, 0);

      const extrudeSettings = {
        steps: 2,
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.2,
        bevelSize: 0.25,
        bevelOffset: 0.5,
        bevelSegments: 2
      };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const material = new THREE.MeshStandardMaterial({
        color: getColorByLevel(node.level),
        roughness: 0,
        metalness: 1,
        depthTest: true,
        depthWrite: true,
        visible: true,
        side: THREE.FrontSide
      });
      const rectangle = new THREE.Mesh(geometry, material);
      rectangle.position.set(0, 0, 0); // Position relative au groupe
      rectangle.userData = node; // Attache les données du nœud à l'objet rectangle

      const group = new THREE.Group();
      group.position.set(node.x, node.y, node.z); // Position absolue
      group.add(rectangle);

      loader.load('/fonts/BionCond_Bold.json', function (font) {
        const textGeometry = new TextGeometry(node.label, {
          font: font,
          size: 0.20,
          depth: 0.05,
          curveSegments: 12,
          bevelEnabled: false
        });
        const textMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0, metalness: 0 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-width / 2 - 0.1, -height / 4 + 0.25, 0.6); // Position relative au groupe
        group.add(textMesh);
      });

      scene.add(group);
      groups.push(group);
      rectangles.push(rectangle); // Ajoute le rectangle à la liste des rectangles
    });

    elements.edges.forEach(edge => {
      const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
      const sourceNode = elements.nodes.find(n => n.id === edge.source);
      const targetNode = elements.nodes.find(n => n.id === edge.target);
      const points = [
        new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z),
        new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z)
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    });

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

    / Animation pour s'éloigner de l'objet actuel
      const tweenAway = new TWEEN.Tween(startPosition)
        .to(intermediatePosition, 1500) // Durée de la première étape de l'animation en ms
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          camera.position.set(startPosition.x, startPosition.y, startPosition.z);
          controls.update();
        })
        .onComplete(() => {
          // Animation pour se déplacer vers l'objet cible
          const tweenToTarget = new TWEEN.Tween(intermediatePosition)
            .to(target, 1500) // Durée de la deuxième étape de l'animation en ms
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
              camera.position.set(intermediatePosition.x, intermediatePosition.y, intermediatePosition.z);
              controls.target.set(targetPosition.x, targetPosition.y, targetPosition.z);
              controls.update();
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
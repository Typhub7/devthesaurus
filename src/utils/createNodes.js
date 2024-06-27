import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

export const createNodes = (elements, scene) => {
  const groups = [];
  const rectangles = [];

  const getColorByLevel = (level) => {
    switch (level) {
      case 0: return 0xc9b037;
      case 1: return 0xb4b4b4;
      case 2: return 0xad8a56;
      default: return 0xffffff;
    }
  };

  const loader = new FontLoader();

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

  return { groups, rectangles };
};

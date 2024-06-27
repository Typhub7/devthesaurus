import * as THREE from 'three';

export const createEdges = (elements, scene) => {
  elements.edges.forEach(edge => {
    const material = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 1 });
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
};
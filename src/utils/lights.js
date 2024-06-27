import * as THREE from 'three';

export const addLights = (scene) => {
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
};

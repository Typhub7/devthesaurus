
import TWEEN from '@tweenjs/tween.js';

export const animateCameraTo = (camera, controls, targetPosition, zoomDistance) => {
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

  const tween = new TWEEN.Tween(startPosition)
    .to(intermediatePosition, 1500) // Durée de l'animation intermédiaire
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      camera.position.set(startPosition.x, startPosition.y, startPosition.z);
      controls.update();
    })
    .onComplete(() => {
      // Nouvelle position de départ après l'animation intermédiaire
      const newStartPosition = {
        x: intermediatePosition.x,
        y: intermediatePosition.y,
        z: intermediatePosition.z
      };

      const finalPosition = {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z + zoomDistance
      };

      const finalTween = new TWEEN.Tween(newStartPosition)
        .to(finalPosition, 1500) // Durée de l'animation finale
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          camera.position.set(newStartPosition.x, newStartPosition.y, newStartPosition.z);
          controls.update();
        })
        .start();
    })
    .start();
};

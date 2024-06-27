export const handleMouseClick = (event, mount, mouse, raycaster, camera, rectangles, setSelectedNode, animateCameraTo, controls) => {
  event.preventDefault();
  const rect = mount.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(rectangles);

  if (intersects.length > 0) {
    const intersected = intersects[0].object;
    setSelectedNode(intersected.userData);
    animateCameraTo(camera, controls, intersected.parent.position, 10); // Transition vers le rectangle cliqué avec une distance de zoom de 10
  }
};

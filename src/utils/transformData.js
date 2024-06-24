export const transformData = (data) => {
  const elements = { nodes: [], edges: [] };

  // Fonction pour calculer les coordonnées sphériques
  const sphericalCoordinates = (radius, theta, phi) => {
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    return { x, y, z };
  };

  const traverse = (node, parent = null, level = 0) => {
    const radius = 3 * level; // Ajustez le rayon pour étendre la sphère en fonction du niveau

    // Calcule les coordonnées sphériques pour le nœud actuel
    const { x, y, z } = sphericalCoordinates(radius, Math.random() * Math.PI * 2, Math.random() * Math.PI);

    const nodeObject = {
      id: node.id,
      label: node.label,
      description: node.description,
      link: node.link,
      level: level,
      x: parent ? parent.x + x : 0,
      y: parent ? parent.y + y : 0,
      z: parent ? parent.z + z : 0
    };
    elements.nodes.push(nodeObject);

    if (parent) {
      elements.edges.push({
        source: parent.id,
        target: node.id
      });
    }

    if (node.children) {
      node.children.forEach((child, index) => {
        // Calcule l'angle pour positionner les enfants de manière équidistante autour du parent
        const angle = (index / node.children.length) * Math.PI * 2;
        const childRadius = radius + 3; // Distance supplémentaire pour les enfants par rapport au parent
        const { x: childX, y: childY, z: childZ } = sphericalCoordinates(childRadius, angle, Math.PI / 2);

        traverse(child, nodeObject, level + 1);
      });
    }
  };

  data.forEach(node => traverse(node));
  return elements;
};
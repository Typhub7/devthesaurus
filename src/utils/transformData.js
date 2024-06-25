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
    const baseRadius = 1.5; // Rayon de base pour les niveaux
    const radius = level === 0 ? 0 : baseRadius * level; // Rayon en fonction du niveau

    // Calcule les coordonnées sphériques pour le nœud actuel
    const { x, y, z } = sphericalCoordinates(radius, Math.random() * Math.PI * 2, Math.random() * Math.PI);

    // Crée un objet pour le nœud actuel avec ses coordonnées
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

    // Ajoute le nœud aux éléments
    elements.nodes.push(nodeObject);

    // Si le nœud a un parent, ajoute une arête entre le parent et le nœud actuel
    if (parent) {
      elements.edges.push({
        source: parent.id,
        target: node.id
      });
    }

    // Si le nœud a des enfants, les traverse récursivement
    if (node.children) {
      node.children.forEach((child, index) => {
        const childLevel = level + 1;

        // Définir un rayon plus petit pour les petits-enfants
        const childRadius = childLevel === 2 ? baseRadius / 5 : baseRadius * 4;

        // Calcule l'angle pour positionner les enfants de manière équidistante autour du parent
        const angle = (index / node.children.length) * Math.PI * 2;

        // Calcule les coordonnées sphériques pour l'enfant
        const { x: childX, y: childY, z: childZ } = sphericalCoordinates(childRadius, angle, Math.PI / 2);

        // Traverse récursivement l'enfant avec les coordonnées ajustées
        traverse(child, {
          ...nodeObject,
          x: nodeObject.x + childX,
          y: nodeObject.y + childY,
          z: nodeObject.z + childZ
        }, childLevel);
      });
    }
  };

  // Traverse chaque nœud racine dans les données
  data.forEach(node => traverse(node));

  // Retourne les éléments transformés
  return elements;
};
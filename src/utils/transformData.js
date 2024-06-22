export const transformData = (data) => {
  const elements = [];

  const traverse = (node, parent = null, level = 0) => {
    elements.push({
      data: { id: node.id, label: node.label, level: level, description: node.description, link: node.link }
    });

    if (parent) {
      elements.push({
        data: { source: parent.id, target: node.id }
      });
    }

    if (node.children) {
      node.children.forEach(child => traverse(child, node, level + 1));
    }
  };

  data.forEach(node => traverse(node));

  return elements;
};
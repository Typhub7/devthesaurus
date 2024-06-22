import React, { useEffect, useState } from 'react';
import cytoscape from 'cytoscape';
import { transformData } from './utils/transformData';
import termsData from './data/terms.json';
import './Graph.css';

const Graph = () => {
  const [info, setInfo] = useState({});

  useEffect(() => {
    const elements = transformData(termsData);

    const cy = cytoscape({
      container: document.getElementById('cy'),
      elements: elements,
      style: [
        {
          selector: 'node[level = 0]',
          style: {
            'label': 'data(label)',
            'background-color': '#FF6347', // Niveau N - rouge tomate
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': '60px',
            'height': '60px',
            'font-size': '10px',
          },
        },
        {
          selector: 'node[level = 1]',
          style: {
            'label': 'data(label)',
            'background-color': '#4682B4', // Niveau N+1 - bleu acier
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': '60px',
            'height': '60px',
            'font-size': '10px',
          },
        },
        {
          selector: 'node[level = 2]',
          style: {
            'label': 'data(label)',
            'background-color': '#3CB371', // Niveau N+2 - vert océan moyen
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': '60px',
            'height': '60px',
            'font-size': '10px',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
          },
        },
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 10,
        circle: true,
        spacingFactor: 1.5,
        boundingBox: { x1: 0, y1: 0, x2: 800, y2: 600 }
      },
    });

    cy.on('tap', 'node', (event) => {
      const node = event.target;
      setInfo({
        label: node.data('label'),
        description: node.data('description'),
        link: node.data('link')
      });
    });
  }, []);

  return (
    <div className="flex">
      <div id="cy" className="w-3/4 h-screen"></div>
      <div className="w-1/4 h-screen p-4 bg-gray-100">
        {info.label && (
          <div>
            <h2 className="text-xl font-bold">{info.label}</h2>
            <p>{info.description}</p>
            {info.link && (
              <a href={info.link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                Learn more
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Graph;
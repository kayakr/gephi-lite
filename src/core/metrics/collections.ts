import { isNumber } from "lodash";
import louvain from "graphology-communities-louvain";
import toSimple from "graphology-operators/to-simple";
import { hits, pagerank } from "graphology-metrics/centrality";
import { disparity, simmelianStrength } from "graphology-metrics/edge";
import betweennessCentrality from "graphology-metrics/centrality/betweenness";

import { Metric } from "./types";
import { graphDatasetAtom } from "../graph";
import { DataGraph, EdgeRenderingData, FullGraph, ItemData } from "../graph/types";
import { dataGraphToFullGraph } from "../graph/utils";
import { toNumber } from "../utils/casting";

function nodeMetric(id: string, attributes: ItemData, index: number, graph: FullGraph) {
  // Your code here
  return Math.random();
}
function edgeMetric(id: string, attributes: ItemData, index: number, graph: FullGraph) {
  // Your code here
  return Math.random();
}

export const NODE_METRICS: Metric<"nodes", any, any>[] = [
  {
    id: "louvain",
    description: true,
    types: { modularityClass: "number" },
    itemType: "nodes",
    parameters: [
      {
        id: "getEdgeWeight",
        type: "attribute",
        itemType: "edges",
        restriction: "quantitative",
        description: true,
      },
      {
        id: "fastLocalMoves",
        type: "boolean",
        defaultValue: true,
        description: true,
      },
      {
        id: "randomWalk",
        type: "boolean",
        defaultValue: true,
        description: true,
      },
      {
        id: "resolution",
        type: "number",
        defaultValue: 1,
        description: true,
      },
    ],
    fn(
      parameters: {
        getEdgeWeight?: keyof EdgeRenderingData;
        fastLocalMoves?: boolean;
        randomWalk?: boolean;
        resolution?: number;
      },
      graph: DataGraph,
    ) {
      return { modularityClass: louvain(graph, { ...parameters, getEdgeWeight: parameters.getEdgeWeight || null }) };
    },
  },
  {
    id: "pagerank",
    types: { pagerank: "number" },
    itemType: "nodes",
    parameters: [
      {
        id: "getEdgeWeight",
        type: "attribute",
        itemType: "edges",
        restriction: "quantitative",
      },
      {
        id: "alpha",
        type: "number",
        defaultValue: 0.85,
      },
      {
        id: "maxIterations",
        type: "number",
        defaultValue: 100,
        min: 1,
      },
      {
        id: "tolerance",
        type: "number",
        defaultValue: 1e-6,
      },
    ],
    fn(
      parameters: {
        getEdgeWeight?: keyof EdgeRenderingData;
        alpha?: number;
        maxIterations?: number;
        tolerance?: number;
      },
      graph: DataGraph,
    ) {
      return { pagerank: pagerank(graph, { ...parameters, getEdgeWeight: parameters.getEdgeWeight || null }) };
    },
  },
  {
    id: "betweennessCentrality",
    types: { betweennessCentrality: "number" },
    itemType: "nodes",
    parameters: [
      {
        id: "getEdgeWeight",
        type: "attribute",
        itemType: "edges",
        restriction: "quantitative",
      },
      {
        id: "normalize",
        type: "boolean",
        defaultValue: true,
      },
    ],
    fn(
      parameters: {
        getEdgeWeight?: keyof EdgeRenderingData;
        normalize?: boolean;
      },
      graph: DataGraph,
    ) {
      return {
        betweennessCentrality: betweennessCentrality(graph, {
          ...parameters,
          getEdgeWeight: parameters.getEdgeWeight || null,
          normalized: parameters.normalize,
        }),
      };
    },
  },
  {
    id: "degree",
    description: true,
    types: { degree: "number" },
    itemType: "nodes",
    parameters: [
      {
        id: "kind",
        type: "enum",
        values: [{ id: "degree" }, { id: "inDegree" }, { id: "outDegree" }],
        defaultValue: "degree",
      },
      {
        id: "getEdgeWeight",
        type: "attribute",
        itemType: "edges",
        restriction: "quantitative",
      },
    ],
    fn(
      {
        kind,
        getEdgeWeight,
      }: {
        kind?: "degree" | "inDegree" | "outDegree";
        getEdgeWeight?: keyof EdgeRenderingData;
      },
      graph: DataGraph,
    ) {
      const collection: Record<string, number> = {};

      if (getEdgeWeight) {
        const reduceEdges = (
          kind === "inDegree" ? graph.reduceInEdges : kind === "outDegree" ? graph.reduceOutEdges : graph.reduceEdges
        ).bind(graph);
        graph.forEachNode((node) => {
          collection[node] = reduceEdges(node, (acc, edge, attr) => acc + (toNumber(attr[getEdgeWeight]) || 0), 0);
        });
      } else {
        const getDegree = graph[kind || "degree"].bind(graph);
        graph.forEachNode((node) => {
          collection[node] = getDegree(node);
        });
      }

      return { degree: collection };
    },
  },
  {
    id: "hits",
    types: { authorities: "number", hubs: "number" },
    itemType: "nodes",
    parameters: [
      {
        id: "getEdgeWeight",
        type: "attribute",
        itemType: "edges",
        restriction: "quantitative",
      },
      {
        id: "maxIterations",
        type: "number",
        defaultValue: 100,
      },
      {
        id: "tolerance",
        type: "number",
        defaultValue: 1e-8,
      },
      {
        id: "normalize",
        type: "boolean",
        defaultValue: true,
      },
    ],
    fn(
      parameters: {
        getEdgeWeight?: keyof EdgeRenderingData;
        maxIterations?: number;
        normalize?: boolean;
        tolerance?: number;
      },
      graph: DataGraph,
    ) {
      return hits(toSimple(graph), parameters);
    },
  },
  {
    id: "nodescript",
    types: { custom: "number" },
    itemType: "nodes",
    parameters: [
      {
        id: "script",
        type: "script",
        functionJsDoc: `/**
* Function that return the metric value for the specified node.
*
* @param {string} id The ID of the node
* @param {Object.<string, number | string | boolean | undefined | null>} attributes Attributes of the node
* @param {number} index The index position of the node in the graph
* @param {Graph} graph The graphology instance (documentation: https://graphology.github.io/)
* @returns number The computed metric of the node
*/`,
        functionCheck: (fn) => {
          if (!fn) throw new Error("Function is not defined");
          const fullGraph = dataGraphToFullGraph(graphDatasetAtom.get());
          const id = fullGraph.nodes()[0];
          const attributs = fullGraph.getNodeAttributes(id);
          const result = fn(id, attributs, 0, fullGraph);
          if (!isNumber(result)) throw new Error("Function must returns a number");
        },
        defaultValue: nodeMetric,
      },
    ],
    fn(parameters: { script?: Function }, graph: DataGraph) {
      const fn = parameters.script;
      if (fn) {
        // we copy the graph to avoid user to modify it
        const graphCopy = graph.copy();
        Object.freeze(graphCopy);

        return {
          custom: graph
            .nodes()
            .map((key, index) => {
              const attributes = graph.getNodeAttributes(key);
              const value = fn(key, attributes, index, graphCopy);
              return { key, value };
            })
            .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as any),
        };
      }
      return {
        custom: {},
      };
    },
  },
];

export const EDGE_METRICS: Metric<"edges", any, any>[] = [
  {
    id: "disparity",
    types: { disparity: "number" },
    itemType: "edges",
    parameters: [
      {
        id: "getEdgeWeight",
        type: "attribute",
        itemType: "edges",
        restriction: "quantitative",
      },
    ],
    fn(
      parameters: {
        getEdgeWeight?: keyof EdgeRenderingData;
      },
      graph: DataGraph,
    ) {
      return { disparity: disparity(toSimple(graph), parameters) };
    },
  },
  {
    id: "simmelianStrength",
    types: { simmelianStrength: "number" },
    itemType: "edges",
    parameters: [],
    fn(parameters: {}, graph: DataGraph) {
      return { simmelianStrength: simmelianStrength(graph) };
    },
  },
  {
    id: "edgescript",
    types: { custom: "number" },
    itemType: "edges",
    parameters: [
      {
        id: "script",
        type: "script",
        functionJsDoc: `/**
* Function that return the metric value for the specified edge.
*
* @param {string} id The ID of the edge
* @param {Object.<string, number | string | boolean | undefined | null>} attributes Attributes of the node
* @param {number} index The index position of the node in the graph
* @param {Graph} graph The graphology instance (documentation: https://graphology.github.io/)
* @returns number The computed metric of the edge
*/`,
        functionCheck: (fn) => {
          if (!fn) throw new Error("Function is not defined");
          const fullGraph = dataGraphToFullGraph(graphDatasetAtom.get());
          const id = fullGraph.edges()[0];
          const attributs = fullGraph.getEdgeAttributes(id);
          const result = fn(id, attributs, 0, fullGraph);
          if (!isNumber(result)) throw new Error("Function must returns a number");
        },
        defaultValue: edgeMetric,
      },
    ],
    fn(parameters: { script?: Function }, graph: DataGraph) {
      const fn = parameters.script;
      if (fn) {
        return {
          custom: graph
            .edges()
            .map((key, index) => {
              const attributes = graph.getEdgeAttributes(key);
              const value = fn(key, attributes, index, graph);
              return { key, value };
            })
            .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as any),
        };
      }
      return {
        custom: {},
      };
    },
  },
];

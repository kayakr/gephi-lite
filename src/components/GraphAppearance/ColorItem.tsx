import { FC, useState } from "react";
import { NodeEdgeProps } from "../forms/NodeEdgeTabs";
import { ColorPartitionEditor } from "./ColorPartitionEditor";
import { ColorRankingEditor } from "./ColorRankingEditor";

type colorMode = "fixed" | "quanti" | "quali";

export const ColorItem: FC<NodeEdgeProps> = ({ nodeEdge }) => {
  const [colorMode, setColorMode] = useState<colorMode>("fixed");

  return (
    <div>
      <h3>Color</h3>
      <label htmlFor="colorMode">Set color from</label>
      <select
        id="colorMode"
        className="form-select"
        value={colorMode}
        onChange={(e) => setColorMode(e.target.value as colorMode)}
      >
        <option value="fixed">fixed color</option>
        <option value="quanti">Ranking (quantitative attribute)</option>
        <option value="quali">Partition (qualitative attribute)</option>
      </select>

      {colorMode === "fixed" && <input type="color" />}
      {colorMode === "quanti" && <ColorRankingEditor nodeEdge={nodeEdge} />}
      {colorMode === "quali" && <ColorPartitionEditor nodeEdge={nodeEdge} />}
    </div>
  );
};

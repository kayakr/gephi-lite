import { groupBy, isEmpty, toPairs } from "lodash";
import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { MdDeselect, MdSelectAll, MdFilterCenterFocus } from "react-icons/md";

import {
  useFilteredGraph,
  useGraphDataset,
  useSelection,
  useSelectionActions,
  useVisualGetters,
} from "../../core/context/dataContexts";
import { ItemType } from "../../core/types";
import { NodeComponent } from "../../components/Node";
import { EdgeComponent } from "../../components/Edge";
import { ItemIcons } from "../../components/common-icons";
import { VisualGetters } from "../../core/appearance/types";
import { ItemData, GraphDataset, DatalessGraph } from "../../core/graph/types";
import { DEFAULT_EDGE_COLOR, DEFAULT_NODE_COLOR } from "../../core/appearance/utils";

function getItemAttributes(
  type: ItemType,
  id: string,
  filteredGraph: DatalessGraph,
  graphDataset: GraphDataset,
  visualGetters: VisualGetters,
): { label: string | undefined; color: string; hidden?: boolean } {
  const data = type === "nodes" ? graphDataset.nodeData[id] : graphDataset.edgeData[id];
  const renderingData = type === "nodes" ? graphDataset.nodeRenderingData[id] : graphDataset.edgeRenderingData[id];
  const getLabel = type === "nodes" ? visualGetters.getNodeLabel : visualGetters.getEdgeLabel;
  const getColor = type === "nodes" ? visualGetters.getNodeColor : visualGetters.getEdgeColor;
  const defaultColor = type === "nodes" ? DEFAULT_NODE_COLOR : DEFAULT_EDGE_COLOR;
  const hidden = type === "nodes" ? !filteredGraph.hasNode(id) : !filteredGraph.hasEdge(id);

  return {
    label: (getLabel ? getLabel(id, data) : renderingData.label) || undefined,
    color: getColor ? getColor(id, data) : renderingData.color || defaultColor,
    hidden,
  };
}

function SelectedItem({
  type,
  id,
  data,
  selectionSize,
}: {
  type: ItemType;
  id: string;
  data: ItemData;
  selectionSize?: number;
}) {
  const { t } = useTranslation();
  const graphDataset = useGraphDataset();
  const visualGetters = useVisualGetters();
  const filteredGraph = useFilteredGraph();
  const { select, unselect } = useSelectionActions();

  const item = getItemAttributes(type, id, filteredGraph, graphDataset, visualGetters);
  let content: ReactNode;
  if (type === "nodes") {
    content = <NodeComponent label={item.label} color={item.color} hidden={item.hidden} />;
  } else {
    const source = getItemAttributes(
      "nodes",
      graphDataset.fullGraph.source(id),
      filteredGraph,
      graphDataset,
      visualGetters,
    );
    const target = getItemAttributes(
      "nodes",
      graphDataset.fullGraph.target(id),
      filteredGraph,
      graphDataset,
      visualGetters,
    );

    content = (
      <EdgeComponent label={item.label} color={item.color} source={source} target={target} hidden={item.hidden} />
    );
  }

  return (
    <li className={`selected-${type}-item mt-2`}>
      <h4 className="fs-6 d-flex flex-row align-items-center">
        <div className="flex-grow-1 flex-shrink-1 text-ellipsis" title={item.label}>
          {content}
        </div>

        <button
          title={t(`selection.unselect_${type}`) as string}
          className="btn btn-sm btn-outline-dark ms-1 flex-shrink-0"
          onClick={() => unselect({ type, items: new Set([id]) })}
        >
          <MdDeselect />
        </button>
        {!item.hidden && (
          <button
            title={t(`selection.focus_${type}`) as string}
            className="btn btn-sm btn-outline-dark ms-1 flex-shrink-0"
            onClick={() => select({ type, items: new Set([id]), replace: true })}
            disabled={selectionSize === 1}
          >
            <MdFilterCenterFocus />
          </button>
        )}
      </h4>
      {selectionSize === 1 &&
        (!isEmpty(data) ? (
          <ul className="ms-4 list-unstyled">
            {toPairs(data).map(([key, value]) => (
              <li key={key}>
                <span className="text-muted">{key}:</span> {value}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-muted fst-italic">{t(`selection.empty_${type}`)}</span>
        ))}
    </li>
  );
}

export const Selection: FC = () => {
  const { t } = useTranslation();
  const { type, items } = useSelection();
  const { select, reset } = useSelectionActions();
  const { nodeData, edgeData } = useGraphDataset();
  const filteredGraph = useFilteredGraph();

  const ItemIcon = ItemIcons[type];

  const isVisible =
    type === "nodes" ? filteredGraph.hasNode.bind(filteredGraph) : filteredGraph.hasEdge.bind(filteredGraph);
  const { visible = [], hidden = [] } = groupBy(Array.from(items), (item) => (isVisible(item) ? "visible" : "hidden"));

  return (
    <>
      <h3 className="fs-5">
        <ItemIcon className="me-1" />
        {t(hidden.length ? `selection.visible_${type}` : `selection.${type}`, { count: visible.length })}
      </h3>

      <div>
        <button
          className="btn btn-sm btn-outline-dark mb-1 me-1"
          onClick={() =>
            select({ type, items: new Set<string>(type === "nodes" ? filteredGraph.nodes() : filteredGraph.edges()) })
          }
        >
          <MdSelectAll className="me-1" /> {t("selection.select_all")}
        </button>
        <button className="btn btn-sm btn-outline-dark mb-1" onClick={() => reset()} disabled={!items.size}>
          <MdDeselect className="me-1" /> {t("selection.unselect_all")}
        </button>
      </div>

      <ul className="list-unstyled">
        {visible.map((item) => (
          <SelectedItem
            key={item}
            id={item}
            type={type}
            selectionSize={items.size}
            data={type === "nodes" ? nodeData[item] : edgeData[item]}
          />
        ))}
      </ul>

      {!!hidden.length && (
        <>
          <hr />

          <h3 className="fs-5">
            <ItemIcon className="me-1" />
            {t(`selection.hidden_${type}`, { count: hidden.length })}
          </h3>

          <div>
            <button
              className="btn btn-sm btn-outline-dark mb-1"
              onClick={() => select({ type, items: new Set(visible), replace: true })}
              disabled={!items.size}
            >
              <MdDeselect className="me-1" /> {t(`selection.unselect_all_hidden_${type}`)}
            </button>
          </div>

          <ul className="list-unstyled">
            {hidden.map((item) => (
              <SelectedItem
                key={item}
                id={item}
                type={type}
                selectionSize={items.size}
                data={type === "nodes" ? nodeData[item] : edgeData[item]}
              />
            ))}
          </ul>
        </>
      )}
    </>
  );
};

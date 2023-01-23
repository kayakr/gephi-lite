import { FC, useState } from "react";
import { ItemType } from "../../../core/types";
import { AttributeSelect } from "../../forms/AttributeSelect";

type LabelSizeMethodType = "itemSize" | "fixed";

interface LabelSpecification {
  attributeId?: string;
  sizeMethod: LabelSizeMethodType;
  size: {
    fixed: number;
    min: number;
    max: number;
  };
  // TODO: zoom factor
  // TODO: label density
  // TODO: font
}

export const LabelItem: FC<{ itemType: ItemType }> = ({ itemType }) => {
  const [labelSpecification, setLabelSpecification] = useState<LabelSpecification>({
    sizeMethod: "itemSize",
    size: { fixed: 5, min: 1, max: 10 },
  });

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h3>Labels</h3>
      <AttributeSelect
        attributeId={labelSpecification?.attributeId}
        onChange={(attId) => setLabelSpecification({ ...labelSpecification, attributeId: attId })}
        itemType={itemType}
        attributesFilter={(a) => !!a.qualitative}
        emptyOptionLabel="No labels"
      />
      <label htmlFor="sizeMethod">Size labels from</label>
      {labelSpecification?.attributeId && (
        <>
          <select
            id="sizeMethod"
            className="form-select"
            value={labelSpecification.sizeMethod}
            onChange={(e) =>
              setLabelSpecification({ ...labelSpecification, sizeMethod: e.target.value as LabelSizeMethodType })
            }
          >
            <option value="itemSize">{itemType} size</option>
            <option value="fixed">fixed size</option>
          </select>
          {labelSpecification.sizeMethod === "fixed" && (
            <input type="number" id="fixedSize" value={labelSpecification.size.fixed} />
          )}
          {labelSpecification.sizeMethod === "itemSize" && (
            <div>
              <input
                type="number"
                id="minSize"
                value={labelSpecification.size.min}
                min="1"
                max={labelSpecification.size.max}
                onChange={(e) =>
                  setLabelSpecification({
                    ...labelSpecification,
                    size: { ...labelSpecification.size, min: +e.target.value },
                  })
                }
              />
              <input
                type="number"
                id="maxSize"
                value={labelSpecification.size.max}
                min={labelSpecification.size.min}
                onChange={(e) =>
                  setLabelSpecification({
                    ...labelSpecification,
                    size: { ...labelSpecification.size, max: +e.target.value },
                  })
                }
              />
            </div>
          )}
        </>
      )}
    </form>
  );
};
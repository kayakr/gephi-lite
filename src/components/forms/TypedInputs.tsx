import cx from "classnames";
import Select from "react-select";
import { FC, InputHTMLAttributes, ReactNode, useMemo } from "react";
import Slider from "rc-slider";
import { SliderProps } from "rc-slider/lib/Slider";
import { clamp } from "lodash";
import * as React from "react";
import { MarkObj } from "rc-slider/lib/Marks";

import { DEFAULT_SELECT_PROPS } from "../consts";

interface BaseTypedInputProps {
  id: string;
  label: ReactNode;
  description?: ReactNode;
}

export const SLIDER_STYLE = {
  dotStyle: { borderColor: "#ccc" },
  railStyle: { backgroundColor: "#ccc" },
  activeDotStyle: { borderColor: "black" },
  trackStyle: { backgroundColor: "black" },
  handleStyle: { backgroundColor: "white", borderColor: "black" },
};

export const NumberInput: FC<
  { value: number | null; onChange: (v: number) => void } & BaseTypedInputProps &
    Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "id">
> = ({ id, label, description, value, onChange, className, ...attrs }) => {
  return (
    <div className="mt-1">
      <label htmlFor={id} className="form-check-label small">
        {label}
      </label>
      <input
        {...attrs}
        type="number"
        className={cx("form-control form-control-sm", className)}
        id={id}
        value={typeof value === "number" ? value : ""}
        onChange={(e) => onChange(+e.target.value)}
      />
      {description && <div className="form-text small text-muted">{description}</div>}
    </div>
  );
};

export const SliderInput: FC<
  {
    value: number | null;
    onChange: (v: number) => void;
    className?: string;
    min: number;
    max: number;
    step: number;
    marks?: Record<string | number, React.ReactNode | MarkObj>;
  } & Omit<BaseTypedInputProps, "id">
> = ({ label, description, value, onChange, min, max, marks, step, className }) => {
  const validMin = useMemo(() => Math.min(min, max), [min, max]);
  const validMax = useMemo(() => Math.max(min, max), [min, max]);
  const validValue = useMemo(() => {
    if (typeof value !== "number") return validMin;
    return clamp(value, validMin, validMax);
  }, [value, validMin, validMax]);

  return (
    <div className={cx("mt-1 px-2", className)}>
      <label className="form-check-label small">{label}</label>
      <div className="pb-3">
        <Slider
          value={validValue}
          min={validMin}
          max={validMax}
          step={step}
          marks={
            marks || {
              [validMin]: validMin,
              [validMax]: validMax,
              [validValue]: validValue,
            }
          }
          onChange={
            ((v: number) => {
              onChange(v);
            }) as SliderProps["onChange"]
          }
          // Styles:
          {...SLIDER_STYLE}
        />
      </div>
      {description && <div className="form-text small text-muted">{description}</div>}
    </div>
  );
};

export const StringInput: FC<
  { value: string | null; onChange: (v: string) => void } & BaseTypedInputProps &
    Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "id">
> = ({ id, label, description, value, onChange, className, ...attrs }) => {
  return (
    <div className="mt-1">
      <label htmlFor={id} className="form-check-label small ms-1">
        {label}
      </label>
      <input
        {...attrs}
        type="string"
        className={cx("form-control form-control-sm", className)}
        id={id}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
      {description && <div className="form-text small text-muted">{description}</div>}
    </div>
  );
};

export const BooleanInput: FC<
  { value: boolean | null; onChange: (v: boolean) => void } & BaseTypedInputProps &
    Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "id">
> = ({ id, label, description, value, onChange, className, ...attrs }) => {
  return (
    <>
      <div className="form-check mt-1">
        <input
          {...attrs}
          type="checkbox"
          className={cx("form-check-input", className)}
          id={id}
          checked={value ?? false}
          onChange={(e) => onChange(!!e.target.checked)}
        />
        <label htmlFor={id} className="form-check-label small ms-1">
          {label}
        </label>
      </div>
      {description && <div className="form-text small text-muted">{description}</div>}
    </>
  );
};

export interface EnumOption {
  value: string;
  label: string | JSX.Element;
}
export const EnumInput: FC<
  {
    value: string | null;
    options: EnumOption[];
    onChange: (v: string | null) => void;
    className?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
  } & BaseTypedInputProps
> = ({ id, label, description, required, disabled, value, options, onChange, className, placeholder }) => {
  const option = options.find((o) => o.value === value);

  return (
    <>
      <div className="mt-1">
        <label htmlFor={id} className="form-check-label small">
          {label}
        </label>
        <Select<EnumOption>
          {...DEFAULT_SELECT_PROPS}
          isDisabled={disabled}
          isClearable={!required}
          className={className}
          placeholder={placeholder}
          value={option || null}
          options={options}
          onChange={(o) => onChange(o?.value || null)}
        />
      </div>
      {description && <div className="form-text small text-muted">{description}</div>}
    </>
  );
};

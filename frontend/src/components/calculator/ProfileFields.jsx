import NumberField from "../common/NumberField";
import SegmentedControl from "../common/SegmentedControl";
import SelectField from "../common/SelectField";
import {
  FiUser,
  FiMaximize,
  FiActivity,
  FiTarget,
} from "react-icons/fi";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const ACTIVITY_OPTIONS = [
  {
    value: "sedentary",
    label: "Sedentary (little or no exercise)",
  },
  {
    value: "light",
    label: "Light (exercise 1-3 days/week)",
  },
  {
    value: "moderate",
    label: "Moderate (exercise 3-5 days/week)",
  },
  {
    value: "active",
    label: "Active (exercise 6-7 days/week)",
  },
  {
    value: "very_active",
    label: "Very active (hard daily exercise)",
  },
];

export default function ProfileFields({
  values,
  onChange,
  errors = {},
  showWeight = true,
}) {
  const set = (field) => (value) =>
    onChange({
      ...values,
      [field]: value,
    });

  return (
    <div className="space-y-3">
      {/* AGE + HEIGHT */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <FiUser size={14} className="text-accent" />
            <span className="text-xs font-medium text-white">
              Age
            </span>
          </div>

          <NumberField
            label=""
            unit="yrs"
            value={values.age}
            onChange={set("age")}
            min={13}
            max={100}
            error={errors.age}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <FiMaximize size={14} className="text-accent" />
            <span className="text-xs font-medium text-white">
              Height
            </span>
          </div>

          <NumberField
            label=""
            unit="cm"
            value={values.heightCm}
            onChange={set("heightCm")}
            min={90}
            max={250}
            error={errors.heightCm}
          />
        </div>
      </div>

      {/* WEIGHT */}
      {showWeight && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <FiTarget size={14} className="text-accent" />
            <span className="text-xs font-medium text-white">
              Weight
            </span>
          </div>

          <NumberField
            label=""
            unit="kg"
            value={values.weightKg}
            onChange={set("weightKg")}
            min={25}
            max={300}
            step={0.1}
            error={errors.weightKg}
          />
        </div>
      )}

      {/* GENDER */}
      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <FiUser size={14} className="text-accent" />
          <span className="text-xs font-medium text-white">
            Gender
          </span>
        </div>

        <SegmentedControl
          label=""
          value={values.gender}
          onChange={set("gender")}
          options={GENDER_OPTIONS}
        />
      </div>

      {/* ACTIVITY */}
      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <FiActivity size={14} className="text-accent" />
          <span className="text-xs font-medium text-white">
            Activity Level
          </span>
        </div>

        <SelectField
          label=""
          value={values.activityLevel}
          onChange={set("activityLevel")}
          options={ACTIVITY_OPTIONS}
          error={errors.activityLevel}
        />
      </div>
    </div>
  );
}

import { TaskUnit, TaskGoalType } from "@/types/task";
import SelectField from "@/components/common/forms/SelectField";
import TextInput from "@/components/common/forms/TextInput";

interface GoalSectionProps {
    goalType: TaskGoalType | undefined;
    targetQuantity: number | undefined;
    unit: TaskUnit | undefined;
    currentQuantity: number | undefined;
    onGoalTypeChange: (checked: boolean) => void;
    onFieldChange: (field: string, value: number | TaskUnit | undefined) => void;
}

export default function GoalSection({
    goalType,
    targetQuantity,
    unit,
    currentQuantity,
    onGoalTypeChange,
    onFieldChange,
}: GoalSectionProps) {
    const isFixed = goalType === TaskGoalType.FIXED;
    const isPercent = !unit || unit === TaskUnit.NONE;

    return (
        <div className="space-y-4">
            <h3 className="overline pt-1">
                Avancerede Indstillinger
            </h3>

            {/* Checkbox */}
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isFixed}
                        onChange={(e) => {
                            onGoalTypeChange(e.target.checked);
                            if (e.target.checked && isPercent) {
                                onFieldChange('target_quantity', 100);
                            }
                        }}
                        className="rounded border-[#E8E6E1] text-[#2C5FE0] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:border-[#2D9F6F] h-4 w-4"
                    />
                </label>
                <div>
                    <span className="label-lg">Mål</span>
                    <p className="caption">
                        Slå til for at tilføje målværdi og enhed til opgaven
                    </p>
                </div>
            </div>

            {/* Expanded fields */}
            {isFixed && (
                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="target_quantity" className="label-lg mb-2 block">
                                Mål<span className="text-[#D64545]">*</span>
                            </label>
                            <TextInput
                                type="number"
                                id="target_quantity"
                                min={0.000001}
                                step="any"
                                placeholder="F.eks. 100"
                                value={isPercent ? 100 : (targetQuantity ?? "")}
                                disabled={isPercent}
                                onChange={(e) => {
                                    const nextValue = e.target.value === "" ? undefined : Number(e.target.value);
                                    onFieldChange('target_quantity', nextValue != null && nextValue > 0 ? nextValue : undefined);
                                }}
                            />
                        </div>

                        <div>
                            <label htmlFor="unit" className="label-lg mb-2 block">
                                Enhed
                            </label>
                            <SelectField
                                id="unit"
                                value={unit || TaskUnit.NONE}
                                onChange={(e) => {
                                    const newUnit = e.target.value as TaskUnit;
                                    onFieldChange('unit', newUnit);
                                    if (newUnit === TaskUnit.NONE) {
                                        onFieldChange('target_quantity', 100);
                                    }
                                }}
                            >
                                <option value={TaskUnit.NONE}>Ingen (vis %)</option>
                                <option value={TaskUnit.METERS}>Meter (m)</option>
                                <option value={TaskUnit.M2}>Kvadratmeter (m²)</option>
                                <option value={TaskUnit.M3}>Kubikmeter (m³)</option>
                                <option value={TaskUnit.TONS}>Ton (t)</option>
                                <option value={TaskUnit.LOADS}>Læs</option>
                                <option value={TaskUnit.PLUGS}>Stik</option>
                            </SelectField>
                            <p className="caption mt-1">Valgfrit: Måleenhed for målværdi</p>
                        </div>
                    </div>

                    {/* Current Quantity */}
                    <div>
                        <label htmlFor="current_quantity" className="label-lg mb-2 block">
                            Start fremskridt
                        </label>
                        <TextInput
                            type="number"
                            id="current_quantity"
                            min={0}
                            step="any"
                            placeholder="F.eks. 0"
                            value={currentQuantity ?? ""}
                            onChange={(e) =>
                                onFieldChange('current_quantity', e.target.value === "" ? undefined : Number(e.target.value))
                            }
                        />
                        <p className="caption mt-1">Valgfrit: Sæt allerede udført mængde</p>
                    </div>
                </div>
            )}
        </div>
    );
}

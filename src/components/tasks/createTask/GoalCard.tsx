import { TaskUnit, TaskGoalType } from "@/types/task";

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
                        onChange={(e) => onGoalTypeChange(e.target.checked)}
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
                            <input
                                type="number"
                                id="target_quantity"
                                min={0}
                                step="any"
                                placeholder="F.eks. 100"
                                value={targetQuantity ?? ""}
                                onChange={(e) =>
                                    onFieldChange('target_quantity', e.target.value === "" ? undefined : Number(e.target.value))
                                }
                                className="block w-full rounded-[12px] border border-[#E8E6E1] px-4 py-3 body-md placeholder:text-[#9DA1B4] bg-white focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="unit" className="label-lg mb-2 block">
                                Enhed
                            </label>
                            <select
                                id="unit"
                                value={unit || TaskUnit.NONE}
                                onChange={(e) => onFieldChange('unit', e.target.value as TaskUnit)}
                                className="block w-full rounded-[12px] border border-[#E8E6E1] px-4 py-3 body-md bg-white focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors"
                            >
                                <option value={TaskUnit.NONE}>Ingen</option>
                                <option value={TaskUnit.HOURS}>Timer</option>
                                <option value={TaskUnit.METERS}>Meter</option>
                                <option value={TaskUnit.KILOMETERS}>Kilometer</option>
                                <option value={TaskUnit.LITERS}>Liter</option>
                                <option value={TaskUnit.KILOGRAMS}>Kilogram</option>
                            </select>
                            <p className="caption mt-1">Valgfrit: Måleenhed for målværdi</p>
                        </div>
                    </div>

                    {/* Current Quantity */}
                    <div>
                        <label htmlFor="current_quantity" className="label-lg mb-2 block">
                            Start fremskridt
                        </label>
                        <input
                            type="number"
                            id="current_quantity"
                            min={0}
                            step="any"
                            placeholder="F.eks. 0"
                            value={currentQuantity ?? ""}
                            onChange={(e) =>
                                onFieldChange('current_quantity', e.target.value === "" ? undefined : Number(e.target.value))
                            }
                            className="block w-full rounded-[12px] border border-[#E8E6E1] px-4 py-3 body-md placeholder:text-[#9DA1B4] bg-white focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors"
                        />
                        <p className="caption mt-1">Valgfrit: Sæt allerede udført mængde</p>
                    </div>
                </div>
            )}
        </div>
    );
}
import { TaskUnit, TaskGoalType } from "@/types/task";

interface GoalSectionProps {
    goalType: TaskGoalType | undefined;
    targetQuantity: number | undefined;
    unit: TaskUnit | undefined;
    currentQuantity: number | undefined;
    onGoalTypeChange: (checked: boolean) => void;
    onFieldChange: (field: string, value: any) => void;
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b-2 border-gray-200">
                Avancerede Indstillinger
            </h3>

            {/* Checkbox */}
            <div className="border border-amber-500">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isFixed}
                        onChange={(e) => onGoalTypeChange(e.target.checked)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span className="text-sm font-semibold text-gray-900">
                        Mål
                    </span>
                </label>
                <p className="mt-1 ml-6 text-xs text-gray-500">
                    Slå til for at tilføje målværdi og enhed til opgaven
                </p>
            </div>

            {/* Expanded fields */}
            {/* border-2 border-gray-200 */}
            {isFixed && (
                <div className="p-4 bg-gray-50 rounded-md  border border-amber-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="target_quantity" className="block text-sm font-semibold text-gray-900 mb-2">
                                Mål<span className="text-red-500">*</span>
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
                                className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="unit" className="block text-sm font-semibold text-gray-900 mb-2">
                                Enhed
                            </label>
                            <select
                                id="unit"
                                value={unit || TaskUnit.NONE}
                                onChange={(e) => onFieldChange('unit', e.target.value as TaskUnit)}
                                className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                            >
                                <option value={TaskUnit.NONE}>Ingen</option>
                                <option value={TaskUnit.HOURS}>Timer</option>
                                <option value={TaskUnit.METERS}>Meter</option>
                                <option value={TaskUnit.KILOMETERS}>Kilometer</option>
                                <option value={TaskUnit.LITERS}>Liter</option>
                                <option value={TaskUnit.KILOGRAMS}>Kilogram</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">Valgfrit: Måleenhed for målværdi</p>
                        </div>
                    </div>

                    {/* Current Quantity */}
                    <div>
                        <label htmlFor="current_quantity" className="block text-sm font-semibold text-gray-900 mb-2">
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
                            className="block w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
                        />
                        <p className="mt-1 text-xs text-gray-500">Valgfrit: Sæt allerede udført mængde</p>
                    </div>
                </div>
            )}
        </div>
    );
}
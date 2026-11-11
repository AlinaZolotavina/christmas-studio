import { t } from '../../i18n';
import { MAX_POSTCARD_CORNER_RADIUS } from '../../domain/postcards/types';
import { NumberField } from '../editor/Inspector';
export function PostcardCornerRadiusField({ value, onChange }: {
    value: number;
    onChange: (value: number) => void;
}) {
    return <NumberField label={t("editor.common.cornerRadius")} value={value} min={0} max={MAX_POSTCARD_CORNER_RADIUS} step={0.5} unit={t("editor.common.millimeters")} onCommit={onChange}/>;
}

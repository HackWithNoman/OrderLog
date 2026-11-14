import {
  PlusCircle,
  Loader2,
  User,
  MapPin,
  Phone,
  DollarSign,
  StickyNote,
} from 'lucide-react';

const FIELDS = [
  {
    name: 'name',
    label: 'Name',
    icon: User,
    type: 'text',
    placeholder: 'e.g. হুমায়রা…',
    autoComplete: 'name',
    required: true,
  },
  {
    name: 'phone',
    label: 'Phone',
    icon: Phone,
    type: 'tel',
    inputMode: 'tel',
    placeholder: 'e.g. 01784204717',
    autoComplete: 'tel',
    required: true,
  },
  {
    name: 'address',
    label: 'Address',
    icon: MapPin,
    type: 'textarea',
    placeholder: 'House, road, area, district…',
    autoComplete: 'street-address',
  },
  {
    name: 'amount',
    label: 'Amount (৳)',
    icon: DollarSign,
    type: 'number',
    inputMode: 'decimal',
    placeholder: '0',
    autoComplete: 'off',
  },
  {
    name: 'note',
    label: 'Note (optional)',
    icon: StickyNote,
    type: 'text',
    placeholder: 'e.g. হিজাব ২ সেট L সাইজ',
    autoComplete: 'off',
  },
];

/**
 * Editable order form. The parent owns the draft via `value` and updates it
 * through `onChange(field, value)`. `onSubmit` fires on submit; `errors`
 * maps field names to inline messages.
 */
export default function OrderForm({
  value,
  onChange,
  onSubmit,
  submitting = false,
  errors = {},
}) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-3 mt-2"
      aria-busy={submitting}
    >
      {FIELDS.map((field) => (
        <FormField
          key={field.name}
          field={field}
          value={value[field.name]}
          error={errors[field.name]}
          onChange={(next) => onChange(field.name, next)}
          disabled={submitting}
        />
      ))}

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary w-full gap-2 mt-4 text-sm sm:text-base rounded-xl font-semibold"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />{' '}
            Adding…
          </>
        ) : (
          <>
            <PlusCircle className="w-5 h-5" aria-hidden="true" /> Add Order
          </>
        )}
      </button>
    </form>
  );
}

function FormField({ field, value, onChange, disabled, error }) {
  const Icon = field.icon;
  const isTextarea = field.type === 'textarea';
  const errorId = `${field.name}-error`;
  const sharedProps = {
    id: field.name,
    name: field.name,
    value,
    onChange: (event) => onChange(event.target.value),
    placeholder: field.placeholder,
    disabled,
    autoComplete: field.autoComplete,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': error ? errorId : undefined,
  };

  return (
    <div className="form-control">
      <label htmlFor={field.name} className="label py-1">
        <span className="label-text font-medium flex items-center gap-1.5 text-xs sm:text-sm">
          <Icon className="w-3.5 h-3.5 text-base-content/60" aria-hidden="true" />
          {field.label}
          {field.required && (
            <span className="text-error" aria-hidden="true">
              *
            </span>
          )}
        </span>
      </label>

      {isTextarea ? (
        <textarea
          {...sharedProps}
          className={`textarea textarea-bordered w-full text-sm h-20 resize-none rounded-xl ${
            error ? 'textarea-error' : ''
          }`}
        />
      ) : (
        <input
          {...sharedProps}
          type={field.type}
          inputMode={field.inputMode}
          min={field.type === 'number' ? '0' : undefined}
          step={field.type === 'number' ? '0.01' : undefined}
          required={field.required}
          spellCheck={field.name === 'note'}
          className={`input input-bordered input-md w-full text-sm rounded-xl ${
            error ? 'input-error' : ''
          }`}
        />
      )}

      {error && (
        <p id={errorId} className="mt-1 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}

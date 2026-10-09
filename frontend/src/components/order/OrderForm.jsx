import { PlusCircle, User, MapPin, Phone, DollarSign, StickyNote } from 'lucide-react';

const FIELDS = [
  { name: 'name', label: 'Name', icon: User, type: 'text', placeholder: 'e.g. হুমায়রা' },
  { name: 'phone', label: 'Phone', icon: Phone, type: 'tel', placeholder: 'e.g. 01784204717' },
  { name: 'address', label: 'Address', icon: MapPin, type: 'textarea', placeholder: 'Delivery address' },
  { name: 'amount', label: 'Amount (৳)', icon: DollarSign, type: 'number', placeholder: '0' },
  { name: 'note', label: 'Note (optional)', icon: StickyNote, type: 'text', placeholder: 'e.g. হিজাব ২ সেট L সাইজ' },
];

/**
 * Editable order form. The parent owns the draft via `value` and updates it
 * through `onChange(field, value)`. `onSubmit` fires on submit.
 */
export default function OrderForm({ value, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-3 mt-2">
      {FIELDS.map((field) => (
        <FormField
          key={field.name}
          field={field}
          value={value[field.name]}
          onChange={(next) => onChange(field.name, next)}
        />
      ))}

      <button
        type="submit"
        className="btn btn-primary w-full gap-2 mt-4 text-sm sm:text-base rounded-xl font-semibold"
      >
        <PlusCircle className="w-5 h-5" /> Add Order
      </button>
    </form>
  );
}

function FormField({ field, value, onChange }) {
  const Icon = field.icon;
  const isTextarea = field.type === 'textarea';

  return (
    <div className="form-control">
      <label className="label py-1">
        <span className="label-text font-medium flex items-center gap-1.5 text-xs sm:text-sm">
          <Icon className="w-3.5 h-3.5 text-base-content/60" /> {field.label}
        </span>
      </label>

      {isTextarea ? (
        <textarea
          name={field.name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className="textarea textarea-bordered w-full focus:textarea-primary text-sm h-20 resize-none rounded-xl"
        />
      ) : (
        <input
          type={field.type}
          name={field.name}
          min={field.type === 'number' ? '0' : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className="input input-bordered input-md w-full focus:input-primary text-sm rounded-xl"
        />
      )}
    </div>
  );
}

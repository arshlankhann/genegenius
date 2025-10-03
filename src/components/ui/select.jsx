import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ children, onValueChange, defaultValue, value, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || '');

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const type = child.type;
        const displayName = type?.displayName;

        if (type === SelectTrigger || displayName === 'SelectTrigger') {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
            selectedValue,
          });
        }

        if (type === SelectValue || displayName === 'SelectValue') {
          return React.cloneElement(child, {
            selectedValue,
          });
        }

        if (type === SelectContent || displayName === 'SelectContent') {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
            onValueChange: handleValueChange,
          });
        }

        return child;
      })}
    </div>
  );
};

const SelectTrigger = React.forwardRef(({ className = '', children, isOpen, setIsOpen, selectedValue, onValueChange, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    role="combobox"
    aria-expanded={isOpen}
    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    onClick={() => setIsOpen?.(!isOpen)}
    {...props}
  >
    {React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;
      const type = child.type;
      const displayName = type?.displayName;
      if (type === SelectValue || displayName === 'SelectValue') {
        return React.cloneElement(child, { selectedValue });
      }
      return child;
    })}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
));
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder, selectedValue, ...props }) => (
  <span {...props}>
    {selectedValue || placeholder}
  </span>
);
SelectValue.displayName = 'SelectValue';

const SelectContent = React.forwardRef(({ className = '', children, isOpen, setIsOpen, onValueChange, selectedValue, ...props }, ref) => {
  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={`absolute top-full left-0 z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg ${className}`}
      {...props}
    >
      <div className="p-1">
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            onValueChange,
            setIsOpen,
          })
        )}
      </div>
    </div>
  );
});
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef(({ className = '', children, value, onValueChange, setIsOpen, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
    onClick={() => {
      onValueChange?.(value);
      setIsOpen?.(false);
    }}
    {...props}
  >
    {children}
  </div>
));
SelectItem.displayName = 'SelectItem';

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
};
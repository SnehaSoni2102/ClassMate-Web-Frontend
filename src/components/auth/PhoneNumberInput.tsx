import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AuthService } from '@/services/auth.service';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  className,
  placeholder = "Enter your mobile number",
  label = "Mobile Number",
  required = true
}) => {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Remove all non-digits
    const digitsOnly = inputValue.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (digitsOnly.length <= 10) {
      onChange(digitsOnly);
    }
  };

  const formatDisplayValue = (phoneNumber: string): string => {
    if (!phoneNumber) return '';
    
    // Format as user types: 12345 67890
    if (phoneNumber.length <= 5) {
      return phoneNumber;
    }
    
    return `${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`;
  };

  const isValid = value.length === 10 && AuthService.validateMobile(value);
  const showError = error || (value.length > 0 && !isValid && !focused);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor="phone-input" className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
          +91
        </div>
        
        <Input
          id="phone-input"
          type="tel"
          value={formatDisplayValue(value)}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "pl-12 pr-4 text-base",
            showError && "border-red-500 focus:border-red-500 focus:ring-red-500",
            isValid && "border-green-500 focus:border-green-500 focus:ring-green-500"
          )}
          maxLength={12} // Account for space in formatting
        />
        
        {isValid && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {showError && (
        <p className="text-sm text-red-600">
          {error || "Please enter a valid 10-digit mobile number"}
        </p>
      )}
      
      {!showError && value.length > 0 && !isValid && (
        <p className="text-sm text-gray-500">
          {value.length < 10 ? `${10 - value.length} more digits needed` : "Invalid mobile number"}
        </p>
      )}
    </div>
  );
};

export default PhoneNumberInput;
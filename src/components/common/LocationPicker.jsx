// src/components/common/LocationPicker.jsx
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import SearchableSelect from '@/components/ui/searchable-select';

const LocationPicker = ({
  control,
  provinceFieldName,
  districtFieldName,
  communeFieldName,
  provinces,
  districts,
  communes,
  onProvinceChange,
  onDistrictChange,
  isLoading,
  disabled = false,
}) => {

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <>
      {/* Province Picker */}
      <FormField
        control={control}
        name={provinceFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tỉnh/Thành phố *</FormLabel>
            <SearchableSelect
              options={(provinces || []).map(p => ({ label: p, value: p }))}
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                onProvinceChange(value);
              }}
              disabled={disabled}
              placeholder="Chọn tỉnh/thành phố"
              searchPlaceholder="Tìm tỉnh/thành phố..."
            />
            <FormMessage />
          </FormItem>
        )}
      />

      {/* District Picker */}
      <FormField
        control={control}
        name={districtFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quận/Huyện *</FormLabel>
            <SearchableSelect
              options={(districts || []).map(d => ({ label: d, value: d }))}
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                onDistrictChange(value);
              }}
              disabled={disabled || (!field.value && districts.length === 0)}
              placeholder={districts.length === 0 ? "Chọn tỉnh/thành trước" : "Chọn quận/huyện"}
              searchPlaceholder="Tìm quận/huyện..."
            />
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Commune Picker */}
      <FormField
        control={control}
        name={communeFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phường/Xã *</FormLabel>
            <SearchableSelect
              options={(communes || []).map(c => ({ label: c, value: c }))}
              value={field.value}
              onChange={field.onChange}
              disabled={disabled || (!field.value && communes.length === 0)}
              placeholder={communes.length === 0 ? "Chọn quận/huyện trước" : "Chọn phường/xã"}
              searchPlaceholder="Tìm phường/xã..."
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default LocationPicker;

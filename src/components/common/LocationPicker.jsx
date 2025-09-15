// src/components/common/LocationPicker.jsx
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

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
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                onProvinceChange(value); 
              }}
              value={field.value || ''}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tỉnh/thành phố" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {(provinces || []).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
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
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                onDistrictChange(value);
              }}
              value={field.value || ''}
              disabled={disabled || (!field.value && districts.length === 0)}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={districts.length === 0 ? "Chọn tỉnh/thành trước" : "Chọn quận/huyện"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {(districts || []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
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
            <Select
              onValueChange={field.onChange}
              value={field.value || ''}
              disabled={disabled || (!field.value && communes.length === 0)}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={communes.length === 0 ? "Chọn quận/huyện trước" : "Chọn phường/xã"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {(communes || []).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default LocationPicker;

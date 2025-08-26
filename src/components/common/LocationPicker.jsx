import { useState, useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Tải dữ liệu địa điểm một cách linh động
const getLocationData = async () => {
  const { default: tree } = await import('../../data/tree.json');
  const provinceNames = tree.map((province) => province.name);
  const locationMap = new Map(tree.map(province => [
    province.name,
    { wards: province.wards }
  ]));
  return { provinceNames, locationMap };
};

const LocationPicker = ({ control, provinceFieldName, wardFieldName }) => {
  const { setValue, getValues } = useFormContext();
  const [locationData, setLocationData] = useState(null);
  const [availableWards, setAvailableWards] = useState([]);

  // 1. Tải dữ liệu địa điểm khi component được mount
  useEffect(() => {
    const loadData = async () => {
      const data = await getLocationData();
      setLocationData(data);
    };
    loadData();
  }, []);

  // 2. Lắng nghe sự thay đổi của trường tỉnh/thành phố
  const watchedProvince = useWatch({
    control,
    name: provinceFieldName,
  });

  // 3. Cập nhật danh sách phường/xã khi tỉnh/thành phố thay đổi
  useEffect(() => {
    if (watchedProvince && locationData) {
      const provinceData = locationData.locationMap.get(watchedProvince);
      const wards = provinceData ? provinceData.wards : [];
      setAvailableWards(wards);

      const currentWard = getValues(wardFieldName);
      if (currentWard && !wards.includes(currentWard)) {
        setValue(wardFieldName, '');
      }
    } else {
      setAvailableWards([]);
    }
  }, [watchedProvince, locationData, getValues, setValue, wardFieldName]);

  const provinceOptions = useMemo(() => {
    if (!locationData) return [];
    return locationData.provinceNames.map((province) => (
      <SelectItem key={province} value={province}>
        {province}
      </SelectItem>
    ));
  }, [locationData]);

  if (!locationData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <>
      <FormField
        control={control}
        name={provinceFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tỉnh/Thành phố *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger className="w-full"> {/* FIX: Added w-full */}
                  <SelectValue placeholder="Chọn tỉnh/thành phố" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>{provinceOptions}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={wardFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phường/Xã *</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || ''}
              disabled={!watchedProvince}
            >
              <FormControl>
                <SelectTrigger className="w-full"> {/* FIX: Added w-full */}
                  <SelectValue
                    placeholder={
                      !watchedProvince
                        ? "Chọn tỉnh/thành phố trước"
                        : "Chọn phường/xã"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableWards.map((ward, index) => (
                  <SelectItem key={`${ward}-${index}`} value={ward}>
                    {ward}
                  </SelectItem>
                ))}
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

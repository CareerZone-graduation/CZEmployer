// src/components/common/LocationPicker.jsx

import { useState, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const processLocationData = (tree) => {
  if (!tree) return null;

  const provinceNames = [];
  const districtMap = {}; // { provinceName: [districtName1, districtName2] }
  const communeMap = {}; // { provinceName_districtName: [communeName1, communeName2] }

  tree.forEach(province => {
    if (!province?.name) return;
    provinceNames.push(province.name);
    const currentDistricts = [];

    (province.districts || []).forEach(district => {
      if (!district?.name) return;
      currentDistricts.push(district.name);
      const communeNames = (district.communes || []).filter(Boolean);
      communeMap[`${province.name}_${district.name}`] = communeNames;
    });
    districtMap[province.name] = currentDistricts;
  });

  return { provinceNames, districtMap, communeMap };
};

const LocationPicker = ({ control, provinceFieldName, districtFieldName, communeFieldName }) => {
  const { setValue, getValues } = useFormContext();
  const [locationData, setLocationData] = useState(null);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableCommunes, setAvailableCommunes] = useState([]);

  // 1. Tải và xử lý dữ liệu địa điểm khi component được mount
  useEffect(() => {
    const loadData = async () => {
      const { default: tree } = await import('../../data/oldtree.json');
      const processedData = processLocationData(tree);
      setLocationData(processedData);
    };
    loadData();
  }, []);

  // 2. Lắng nghe sự thay đổi của trường Tỉnh/Thành phố
  const watchedProvince = useWatch({ control, name: provinceFieldName });

  // 3. Lắng nghe sự thay đổi của trường Quận/Huyện
  const watchedDistrict = useWatch({ control, name: districtFieldName });

  // 4. Cập nhật danh sách Quận/Huyện khi Tỉnh/Thành phố thay đổi
  useEffect(() => {
    if (watchedProvince && locationData) {
      const districts = locationData.districtMap[watchedProvince] || [];
      setAvailableDistricts(districts);

      // Reset quận/huyện và phường/xã nếu tỉnh thay đổi
      const currentDistrict = getValues(districtFieldName);
      if (currentDistrict && !districts.includes(currentDistrict)) {
        setValue(districtFieldName, '');
        setValue(communeFieldName, '');
      }
    } else {
      setAvailableDistricts([]);
      setAvailableCommunes([]);
    }
  }, [watchedProvince, locationData, setValue, districtFieldName, communeFieldName, getValues]);

  // 5. Cập nhật danh sách Phường/Xã khi Quận/Huyện thay đổi
  useEffect(() => {
    if (watchedProvince && watchedDistrict && locationData) {
        const key = `${watchedProvince}_${watchedDistrict}`;
        const communes = locationData.communeMap[key] || [];
        setAvailableCommunes(communes);

        // Reset phường/xã nếu quận/huyện thay đổi
        const currentCommune = getValues(communeFieldName);
        if (currentCommune && !communes.includes(currentCommune)) {
            setValue(communeFieldName, '');
        }
    } else {
        setAvailableCommunes([]);
    }
  }, [watchedProvince, watchedDistrict, locationData, setValue, communeFieldName, getValues]);


  if (!locationData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tỉnh/thành phố" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {locationData.provinceNames.map((p, index) => <SelectItem key={`${p}-${index}`} value={p}>{p}</SelectItem>)}
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
            <Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchedProvince}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={!watchedProvince ? "Chọn tỉnh/thành trước" : "Chọn quận/huyện"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent key={watchedProvince}>
                {availableDistricts.map((d, index) => <SelectItem key={`${d}-${index}`} value={d}>{d}</SelectItem>)}
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
            <Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchedDistrict}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={!watchedDistrict ? "Chọn quận/huyện trước" : "Chọn phường/xã"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent key={watchedDistrict}>
                {availableCommunes.map((c, index) => <SelectItem key={`${c}-${index}`} value={c}>{c}</SelectItem>)}
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

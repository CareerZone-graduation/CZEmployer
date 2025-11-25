import { useMemo } from 'react';
import { getProvinces, getDistrictsForProvince, getCommunesForDistrict } from '@/utils/locationUtils';

export const useLocationData = (selectedProvince, selectedDistrict) => {
    const provinces = useMemo(() => getProvinces(), []);

    const districts = useMemo(() => {
        return getDistrictsForProvince(selectedProvince);
    }, [selectedProvince]);

    const communes = useMemo(() => {
        return getCommunesForDistrict(selectedProvince, selectedDistrict);
    }, [selectedProvince, selectedDistrict]);

    return { provinces, districts, communes };
};

import locationTree from '@/data/oldtree.json';
import { findBestMatch } from 'string-similarity';
const locationData = {
  provinces: [],
  districts: {},
  communes: {},
};
const PREFIXES = /^(thanh pho|tp|tinh|quan|q|huyen|thi xa|tx|phuong|xa|thi tran|tt)\.?\s*/i;

function normalizeForComparison(s) {
  if (!s || typeof s !== 'string') return '';

  let x = s.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ') // thay mọi ký tự không chữ/số thành khoảng trắng
    .trim();

  // cắt tiền tố ở đầu (thành phố, quận, huyện, …)
  x = x.replace(PREFIXES, '').trim();

  // nếu còn lại toàn số thì parse thành số để loại bỏ 0 ở đầu
  if (/^\d+$/.test(x)) {
    x = String(parseInt(x, 10)); // "01" -> "1"
  }

  // bỏ khoảng trắng cuối cùng để so sánh
  return x.replace(/\s+/g, '');
}

// --- Tải và xử lý dữ liệu ---
locationTree.forEach(province => {
  const provinceName = province.name;
  locationData.provinces.push({
    original: provinceName,
    normalized: normalizeForComparison(provinceName)
  });

  const districtList = [];
  locationData.districts[provinceName] = districtList;

  (province.districts || []).forEach(district => {
    const districtName = district.name;
    districtList.push({
      original: districtName,
      normalized: normalizeForComparison(districtName)
    });
    
    const communeList = [];
    locationData.communes[`${provinceName}_${districtName}`] = communeList;

    (district.communes || []).forEach(communeName => {
        communeList.push({
            original: communeName,
            normalized: normalizeForComparison(communeName)
        });
    });
  });
});

function findBestMatchName(nameFromApi, officialNameObjects) {
  console.log(`\n[Debug] Bắt đầu tìm kiếm cho: "${nameFromApi}"`);
  if (!nameFromApi || !officialNameObjects || officialNameObjects.length === 0) {
    return nameFromApi;
  }
  const normalizedApiName = normalizeForComparison(nameFromApi);
  const officialNormalizedNames = officialNameObjects.map(item => item.normalized);
  const directMatchIndex = officialNormalizedNames.indexOf(normalizedApiName);
  if (directMatchIndex > -1) {
    return officialNameObjects[directMatchIndex].original;
  }
  const ratings = findBestMatch(normalizedApiName, officialNormalizedNames);
  if (ratings.bestMatch.rating > 0.7) {
    const bestMatchIndex = ratings.bestMatchIndex;
    return officialNameObjects[bestMatchIndex].original;
  }
  return nameFromApi;
}

// =================================================================
// THAY ĐỔI LỚN VÀ QUAN TRỌNG NHẤT LÀ Ở HÀM DƯỚI ĐÂY
// =================================================================
export const mapGoongLocationToStandard = (compound) => {
  if (!compound) {
    return { province: '', district: '', commune: '' };
  }

  const { province: rawProvince, district: rawDistrict, commune: rawCommune } = compound;

  // Bước 1: Tìm tỉnh/thành phố CHÍNH XÁC từ oldtree.json
  const mappedProvince = findBestMatchName(rawProvince, locationData.provinces);

  // Bước 2: Dùng tỉnh/thành phố ĐÃ TÌM ĐƯỢC để lấy đúng danh sách quận/huyện
  const districtObjects = locationData.districts[mappedProvince];
  const mappedDistrict = findBestMatchName(rawDistrict, districtObjects);

  // Bước 3: Dùng cả tỉnh và huyện ĐÃ TÌM ĐƯỢC để lấy đúng danh sách xã/phường
  const communeObjects = locationData.communes[`${mappedProvince}_${mappedDistrict}`];
  const mappedCommune = findBestMatchName(rawCommune, communeObjects);

  // console.log('[Location Mapping Final]', {
  //   raw: { province: rawProvince, district: rawDistrict, commune: rawCommune },
  //   mapped: { province: mappedProvince, district: mappedDistrict, commune: mappedCommune },
  // });

  return {
    province: mappedProvince,
    district: mappedDistrict,
    commune: mappedCommune,
  };
};


// --- Các hàm helper cho form không thay đổi ---

export function getDistrictsForProvince(provinceName) {
  if (!provinceName || !locationData.districts[provinceName]) {
    return [];
  }
  return locationData.districts[provinceName].map(d => d.original);
}

export function getCommunesForDistrict(provinceName, districtName) {
  if (!provinceName || !districtName || !locationData.communes[`${provinceName}_${districtName}`]) {
    return [];
  }
  return locationData.communes[`${provinceName}_${districtName}`].map(c => c.original);
}

export function getProvinces() {
    return locationData.provinces.map(p => p.original);
}
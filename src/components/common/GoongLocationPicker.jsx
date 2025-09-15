import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { mapGoongLocationToStandard } from '@/utils/locationUtils';

// Helper to load scripts dynamically
const loadScript = (src, onLoad) => {
  if (document.querySelector(`script[src="${src}"]`)) {
    if (onLoad) onLoad();
    return;
  }
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.onload = onLoad;
  document.body.appendChild(script);
};

const loadStylesheet = (href) => {
  if (document.querySelector(`link[href="${href}"]`)) {
    return;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};

// IMPORTANT: User needs to add these to their .env file
const GOONG_MAPS_KEY = import.meta.env.VITE_GOONG_MAPS_KEY || 'zezmDr9yRepNMT4ImBxgu6wZHgB958ueXuMmx6ax';
const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY || 'b09VxdsZtQunZ4oTK5IJA0xEmOc9lUhqgxZx975w';

const GoongLocationPicker = ({ value, onLocationChange }) => {
  const mapContainerRef = useRef(null);
  const geocoderContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [address, setAddress] = useState(value?.address || '');

  const handleLocationUpdate = useCallback(
    (data) => {
      onLocationChange(data);
      if (data.address) {
        setAddress(data.address);
      }
    },
    [onLocationChange]
  );
  
  useEffect(() => {
    // Tải các file CSS
    loadStylesheet('https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css');
    loadStylesheet('https://cdn.jsdelivr.net/npm/@goongmaps/goong-geocoder@1.1.1/dist/goong-geocoder.css');

    const initializeMap = () => {
      const GeocoderCtor = window.GoongGeocoder?.default || window.GoongGeocoder;
      if (!GeocoderCtor) {
        console.error('GoongGeocoder chưa sẵn sàng. Kiểm tra URL script hoặc thứ tự tải.');
        return;
      }
      if (!window.goongjs || mapRef.current || !mapContainerRef.current) return;

      window.goongjs.accessToken = GOONG_MAPS_KEY;
      const map = new window.goongjs.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: [value?.lng || 105.84478, value?.lat || 21.02897],
        zoom: 13,
      });
      mapRef.current = map;

      // Chỉ khởi tạo GoongGeocoder sau khi script của nó đã được tải
      const geocoder = new window.GoongGeocoder({ 
        accessToken: GOONG_API_KEY,
        goongjs: window.goongjs,
        marker: false,
      });

      if (geocoderContainerRef.current) {
        while (geocoderContainerRef.current.firstChild) {
          geocoderContainerRef.current.removeChild(geocoderContainerRef.current.firstChild);
        }
        geocoderContainerRef.current.appendChild(geocoder.onAdd(map));
      }

      const marker = new window.goongjs.Marker({ color: 'red', draggable: true });
      markerRef.current = marker;

      if (value?.lat && value?.lng) {
        marker.setLngLat([value.lng, value.lat]).addTo(map);
      }

      const reverseGeocode = async (lat, lng) => {
        const url = `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${GOONG_API_KEY}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          const item = data?.results?.[0];
          if (item) {
            const normalizedLocation = mapGoongLocationToStandard(item.compound);
            handleLocationUpdate({
              lat,
              lng,
              address: item.formatted_address,
              ...normalizedLocation,
            });
          }
        } catch (e) {
          console.warn('Reverse geocode failed:', e);
        }
      };

      // geocoder.on('result', (e) => {

      //   const payload = e?.result?.result || {};
      //   const loc = payload.geometry?.location || {};
      //   if (loc.lat && loc.lng) {
      //     const coords = [loc.lng, loc.lat];
      //     marker.setLngLat(coords).addTo(map);
      //     map.flyTo({ center: coords, zoom: 15 });
          
      //     const normalizedLocation = mapGoongLocationToStandard(payload.compound);
      //     handleLocationUpdate({
      //         lat: loc.lat,
      //         lng: loc.lng,
      //         address: payload.formatted_address,
      //         ...normalizedLocation,
      //     });
      //   }
      // });

      // map.on('click', (e) => {
      //   const { lng, lat } = e.lngLat;
      //   marker.setLngLat([lng, lat]).addTo(map);
      //   map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 15) });
      //   reverseGeocode(lat, lng);
      // });

       geocoder.on('result', (e) => {
        const payload = e?.result?.result || {};
        const loc = payload.geometry?.location || {};
        if (loc.lat && loc.lng) {
          const coords = [loc.lng, loc.lat];
          marker.setLngLat(coords).addTo(map);
          map.flyTo({ center: coords, zoom: 15 });
          
          // GỌI REVERSEGEOCODE ĐỂ ĐẢM BẢO DỮ LIỆU LUÔN ĐẦY ĐỦ
          reverseGeocode(loc.lat, loc.lng);
        }
       });


      map.on('click', (e) => { // Luồng này đã đúng, giữ nguyên
        const { lng, lat } = e.lngLat;
        marker.setLngLat([lng, lat]).addTo(map);
        map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 15) });
        reverseGeocode(lat, lng);
      });
      
      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat();
        reverseGeocode(lat, lng);
      });

      map.on('load', () => map.resize());
      const resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        map.remove();
      };
    };

    // **ĐÂY LÀ PHẦN SỬA LỖI QUAN TRỌNG NHẤT**
    // Lồng các lệnh gọi loadScript để đảm bảo thứ tự tải chính xác
    loadScript('https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js', () => {
      // Chỉ bắt đầu tải geocoder-script SAU KHI map-script đã tải xong
      loadScript('https://cdn.jsdelivr.net/npm/@goongmaps/goong-geocoder@1.1.1/dist/goong-geocoder.min.js', initializeMap);
    });
  }, []);

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    // Also update the parent form state
    onLocationChange({
      ...value,
      address: newAddress,
    });
  };


  return (
    <div className="space-y-4 w-full">
      <div id="geocoder-container" ref={geocoderContainerRef} className="relative z-10"></div>
      
       {/* <Input 
          placeholder="Địa chỉ chi tiết (số nhà, tên đường, tòa nhà...)" 
          value={address}
          onChange={handleAddressChange}
       /> */}

      <div
        ref={mapContainerRef}
        className="w-full h-64 md:h-80 rounded-lg shadow-inner"
        style={{ overflow: 'hidden' }}
      ></div>
      <p className="text-sm text-muted-foreground">
        Gợi ý: nếu kết quả tìm kiếm chưa chính xác, hãy <b>click lên bản đồ</b> hoặc <b>kéo thả marker</b> đến vị trí đúng.
      </p>
    </div>
  );
};

export default GoongLocationPicker;
# Hướng dẫn Frontend Recruiter - CV Masking

## 📋 Tổng quan

Giao diện recruiter đã được cập nhật để:
1. ✅ Hiển thị thông tin ứng viên đã được che (email, SĐT)
2. ✅ Chỉ hiển thị CV được ứng viên chọn (khi chưa unlock)
3. ✅ Xem CV qua API endpoint (có masking tự động)
4. ✅ Mở khóa profile để xem đầy đủ thông tin

## 🎯 Luồng sử dụng

### 1. Xem profile ứng viên (Chưa unlock)

```
Recruiter → Candidates → Click vào ứng viên
  ↓
Hiển thị:
  - Email: n***a@example.com (đã che)
  - Phone: 098****567 (đã che)
  - CV: Chỉ 1 CV (CV ứng viên đã chọn)
  - Banner: "Hồ sơ đang bị khóa"
```

### 2. Xem CV (Chưa unlock)

```
Click vào CV → Mở trong tab mới
  ↓
URL: /api/v1/recruiter/candidates/{userId}/cv/{cvId}
  ↓
Backend:
  - Kiểm tra quyền truy cập
  - Tải PDF từ Cloudinary
  - Che email và SĐT bằng hình chữ nhật xám
  - Trả về PDF đã che
```

### 3. Mở khóa profile

```
Click "Mở khóa hồ sơ"
  ↓
POST /api/v1/recruiter/candidates/{userId}/unlock
  ↓
Backend:
  - Kiểm tra số dư coin
  - Trừ coin (ví dụ: 50 coins)
  - Tạo bản ghi ProfileUnlock
  ↓
Refresh page → Hiển thị đầy đủ:
  - Email: nguyen@example.com (không che)
  - Phone: 0987654321 (không che)
  - CV: Tất cả CV của ứng viên
```

## 📁 Files đã cập nhật

### 1. CandidateProfile.jsx

**Thay đổi chính:**

```jsx
// Trước: Hiển thị cvFiles
{profile.cvFiles && profile.cvFiles.length > 0 && (
  <Card>
    <CardTitle>CV đính kèm</CardTitle>
    {profile.cvFiles.map((cv) => (
      <Link to="/cv-viewer" state={{ cvUrl: cv.path }}>
        {cv.name}
      </Link>
    ))}
  </Card>
)}

// Sau: Hiển thị cvs qua API endpoint
{profile.cvs && profile.cvs.length > 0 && (
  <Card>
    <CardTitle className="flex items-center justify-between">
      <span>CV đính kèm</span>
      {isLocked && (
        <Badge variant="outline">
          <Lock className="h-3 w-3 mr-1" />
          Đã che thông tin
        </Badge>
      )}
    </CardTitle>
    {profile.cvs.map((cv) => (
      <button
        onClick={() => {
          const cvUrl = `${import.meta.env.VITE_API_URL}/recruiter/candidates/${userId}/cv/${cv._id}`;
          window.open(cvUrl, '_blank');
        }}
      >
        <FileText className="h-6 w-6" />
        <div>
          <p>{cv.name}</p>
          <p className="text-xs">
            {isLocked 
              ? 'Email và SĐT đã được che • Click để xem' 
              : `Tải lên: ${new Date(cv.uploadedAt).toLocaleDateString('vi-VN')}`
            }
          </p>
        </div>
        {isLocked && <Lock className="h-4 w-4" />}
      </button>
    ))}
    {isLocked && (
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs">
          💡 <strong>Lưu ý:</strong> Bạn đang xem CV đã được che thông tin nhạy cảm. 
          Mở khóa hồ sơ để xem đầy đủ thông tin và tất cả CV của ứng viên.
        </p>
      </div>
    )}
  </Card>
)}
```

**Các thay đổi:**
1. ✅ Đổi từ `cvFiles` → `cvs` (theo API mới)
2. ✅ Hiển thị badge "Đã che thông tin" khi locked
3. ✅ Mở CV qua API endpoint thay vì link Cloudinary trực tiếp
4. ✅ Hiển thị thông báo lưu ý khi locked
5. ✅ Icon Lock để chỉ rõ trạng thái

### 2. candidateService.js

**Không cần thay đổi** - API đã đúng:

```javascript
export const getCandidateProfile = async (userId) => {
  const response = await apiClient.get(`/recruiters/candidates/${userId}`);
  return response;
};

export const unlockCandidateProfile = async (userId) => {
  const response = await apiClient.post(`/recruiters/candidates/${userId}/unlock`);
  return response.data;
};
```

### 3. apiClient.js

**Không cần thay đổi** - Đã có Authorization header:

```javascript
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});
```

## 🎨 UI Components

### Unlock Banner (Khi chưa unlock)

```jsx
<Card className="mb-6 border-yellow-200 bg-yellow-50">
  <CardContent className="pt-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Lock className="h-8 w-8 text-yellow-600" />
        <div>
          <h3 className="font-semibold text-yellow-900">Hồ sơ đang bị khóa</h3>
          <p className="text-sm text-yellow-700">
            Thông tin liên hệ đã được ẩn. Mở khóa để xem đầy đủ thông tin ứng viên.
          </p>
        </div>
      </div>
      <Button
        onClick={handleUnlockProfile}
        disabled={isUnlocking}
        className="bg-yellow-600 hover:bg-yellow-700"
      >
        <Unlock className="h-4 w-4 mr-2" />
        {isUnlocking ? 'Đang mở khóa...' : 'Mở khóa hồ sơ'}
      </Button>
    </div>
  </CardContent>
</Card>
```

### CV Card (Với masking indicator)

```jsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      <span>CV đính kèm</span>
      {isLocked && (
        <Badge variant="outline" className="text-xs">
          <Lock className="h-3 w-3 mr-1" />
          Đã che thông tin
        </Badge>
      )}
    </CardTitle>
    {isLocked && (
      <CardDescription className="text-xs">
        Chỉ hiển thị CV ứng viên đã chọn. Email và SĐT trong CV đã được che.
      </CardDescription>
    )}
  </CardHeader>
  <CardContent>
    {/* CV list */}
  </CardContent>
</Card>
```

## 🔧 Environment Variables

Đảm bảo file `.env` có:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## 🧪 Testing

### Test Case 1: Xem profile chưa unlock
1. Login as recruiter
2. Vào trang Candidates
3. Click vào 1 ứng viên
4. **Kiểm tra:**
   - ✅ Email bị che: `n***a@example.com`
   - ✅ Phone bị che: `098****567`
   - ✅ Chỉ hiển thị 1 CV
   - ✅ Có banner "Hồ sơ đang bị khóa"
   - ✅ Có badge "Đã che thông tin" trên CV card

### Test Case 2: Xem CV (chưa unlock)
1. Click vào CV
2. **Kiểm tra:**
   - ✅ Mở trong tab mới
   - ✅ URL: `/api/v1/recruiter/candidates/{userId}/cv/{cvId}`
   - ✅ PDF hiển thị với email/SĐT bị che bằng hình chữ nhật xám

### Test Case 3: Mở khóa profile
1. Click "Mở khóa hồ sơ"
2. **Kiểm tra:**
   - ✅ Toast success: "Đã mở khóa hồ sơ thành công!"
   - ✅ Page refresh
   - ✅ Email hiển thị đầy đủ
   - ✅ Phone hiển thị đầy đủ
   - ✅ Hiển thị tất cả CV (nếu có nhiều)
   - ✅ Không còn banner "Hồ sơ đang bị khóa"

### Test Case 4: Xem CV (đã unlock)
1. Click vào bất kỳ CV nào
2. **Kiểm tra:**
   - ✅ PDF hiển thị đầy đủ, không bị che

### Test Case 5: Không đủ coin
1. Đảm bảo recruiter có < 50 coins
2. Click "Mở khóa hồ sơ"
3. **Kiểm tra:**
   - ✅ Toast error: "Không đủ coin để mở khóa"
   - ✅ Profile vẫn bị khóa

## 🎨 Styling

### Colors:
- **Yellow** (`yellow-50`, `yellow-600`): Unlock banner, warning
- **Blue** (`blue-50`, `blue-600`): Info box
- **Muted**: Masked information

### Icons:
- `Lock`: Profile locked, CV masked
- `Unlock`: Unlock action
- `FileText`: CV file
- `Eye`: View action

## 📊 API Response Format

### GET /recruiter/candidates/:userId (Chưa unlock)

```json
{
  "success": true,
  "data": {
    "fullname": "Nguyễn Văn A",
    "email": "n***a@example.com",
    "phone": "098****567",
    "isUnlocked": false,
    "cvs": [
      {
        "_id": "673abc123",
        "name": "CV_Frontend_Developer.pdf",
        "uploadedAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

### GET /recruiter/candidates/:userId (Đã unlock)

```json
{
  "success": true,
  "data": {
    "fullname": "Nguyễn Văn A",
    "email": "nguyen@example.com",
    "phone": "0987654321",
    "isUnlocked": true,
    "cvs": [
      {
        "_id": "673abc123",
        "name": "CV_Frontend_Developer.pdf",
        "uploadedAt": "2024-01-15T10:00:00Z"
      },
      {
        "_id": "673def456",
        "name": "CV_Fullstack_2024.pdf",
        "uploadedAt": "2024-01-10T10:00:00Z"
      }
    ]
  }
}
```

## 🚀 Deployment

1. Build frontend:
   ```bash
   cd fe-recruiter
   npm run build
   ```

2. Deploy to hosting (Vercel, Netlify, etc.)

3. Đảm bảo environment variables được set đúng

## 🔮 Future Enhancements

1. **Preview CV**: Xem trước CV trước khi mở khóa
2. **Bulk unlock**: Mở khóa nhiều profile cùng lúc
3. **Unlock history**: Lịch sử mở khóa
4. **Notification**: Thông báo khi ứng viên cập nhật CV
5. **Compare candidates**: So sánh nhiều ứng viên
6. **Save to talent pool**: Lưu ứng viên vào talent pool

---

**Last Updated**: 2024-01-15
**Status**: ✅ Ready for Testing

# Header Component

A professional, responsive header component designed for the CareerZone homepage redesign. This component provides improved navigation, branding, and accessibility features.

## Features

- **Professional Branding**: Clean logo design with CareerZone branding
- **Responsive Navigation**: Desktop horizontal menu with mobile hamburger menu
- **Accessibility Compliant**: WCAG 2.1 AA compliant with proper ARIA labels, keyboard navigation, and focus management
- **Mobile-First Design**: Responsive design that works across all screen sizes
- **Modern UI**: Uses shadcn/ui components with Tailwind CSS styling

## Usage

### Basic Usage

```jsx
import Header from '@/components/common/Header';

function App() {
  return (
    <div>
      <Header />
      {/* Your page content */}
    </div>
  );
}
```

### With Custom Styling

```jsx
import Header from '@/components/common/Header';

function App() {
  return (
    <div>
      <Header className="border-b-2 border-emerald-200" />
      {/* Your page content */}
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes to apply to the header |

## Navigation Items

The header includes the following navigation items:

- **Tính năng** (`#features`) - Links to features section
- **Giải pháp** (`#solutions`) - Links to solutions section  
- **Giá cả** (`#pricing`) - Links to pricing section
- **Liên hệ** (`#contact`) - Links to contact section

## Authentication Buttons

- **Đăng nhập** - Links to `/auth/login`
- **Dùng thử miễn phí** - Links to `/auth/register`

## Accessibility Features

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Proper tab order and focus management
- Focus indicators for all focusable elements

### Screen Reader Support
- Semantic HTML structure with proper landmarks
- ARIA labels for navigation and interactive elements
- Screen reader friendly mobile menu

### Visual Accessibility
- High contrast colors meeting WCAG standards
- Scalable text and icons
- Clear visual hierarchy

## Mobile Behavior

On mobile devices (< 768px):
- Navigation menu collapses into a hamburger menu
- Mobile menu slides in from the right
- Touch-friendly button sizes
- Optimized spacing for mobile interaction

## Responsive Breakpoints

- **Mobile**: < 768px (hamburger menu)
- **Desktop**: ≥ 768px (horizontal navigation)

## Dependencies

- `react-router-dom` - For navigation links
- `lucide-react` - For icons
- `@/components/ui/button` - shadcn/ui Button component
- `@/components/ui/sheet` - shadcn/ui Sheet component for mobile menu
- `@/lib/utils` - Utility functions (cn for className merging)

## Styling

The component uses Tailwind CSS classes and follows the design system:

- **Colors**: Emerald color scheme (`emerald-500`, `emerald-600`)
- **Typography**: Professional font weights and sizes
- **Shadows**: Subtle shadows for depth
- **Transitions**: Smooth hover and focus transitions

## Testing

The component includes comprehensive tests covering:

- Rendering of all navigation elements
- Accessibility attributes and landmarks
- Mobile menu functionality
- Keyboard navigation
- Custom className application

Run tests with:
```bash
npm test Header.test.jsx
```

## Integration with Homepage

The Header component is designed to work seamlessly with the new Homepage component:

```jsx
import Header from '@/components/common/Header';
import Homepage from '@/components/common/Homepage';

function App() {
  return <Homepage />; // Header is included in Homepage
}
```

## Requirements Satisfied

This component satisfies the following requirements from the homepage redesign spec:

- **1.1**: Professional and trustworthy design with clean, modern header
- **1.3**: Consistent professional styling and responsive design
- **4.1**: Keyboard navigation and focus indicators
- **4.2**: Screen reader compatibility and semantic markup
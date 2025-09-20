# Design Guidelines: Product Development & Inventory Management System

## Design Approach
**System-Based Approach**: Material Design 3 with enterprise focus
This is a utility-focused business application requiring efficiency, data organization, and collaborative workflows. Material Design 3 provides excellent patterns for data-dense interfaces, file management, and team collaboration tools.

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: 219 69% 44% (Professional blue for trust and reliability)
- Surface: 0 0% 98% (Clean white backgrounds)
- Surface Variant: 220 14% 96% (Subtle gray for cards and sections)

**Dark Mode:**
- Primary: 219 69% 64% (Lighter blue for contrast)
- Surface: 220 13% 9% (Dark gray backgrounds)
- Surface Variant: 220 9% 15% (Elevated surfaces)

### B. Typography
**Font Family**: Inter (Google Fonts)
- Headers: Inter 600 (Semi-bold)
- Body: Inter 400 (Regular)
- Labels: Inter 500 (Medium)
- Data/Numbers: Inter 500 (Medium for emphasis)

### C. Layout System
**Tailwind Spacing Units**: 2, 4, 6, 8, 12, 16
- Dense data layouts: p-2, gap-4
- Card spacing: p-6, m-4
- Section spacing: py-8, px-6
- Major layout margins: m-12, p-16

### D. Component Library

**Navigation**: Top navigation bar with module tabs (Fabrics, Accessories, Design Ideas, Products, Development, Clients) plus secondary sidebar for sub-sections

**Data Display**: 
- Cards for individual items (fabrics, products) with image thumbnails
- Tables for detailed lists with sorting/filtering
- Progress indicators for development tracking
- File upload zones with drag-and-drop styling

**Forms**:
- Multi-step forms for complex entries (new designs, products)
- Image upload areas with preview grids
- Rich text editors for descriptions and analysis
- Cost breakdown input sections with calculated totals

**3D Model Integration**: Dedicated viewer component with loading states and basic controls (rotate, zoom)

### E. Key Interface Patterns

**Dashboard Structure**: 
- Main content area with module-specific views
- Consistent header with breadcrumb navigation
- Action buttons positioned top-right for primary actions
- Filter/search controls integrated into table headers

**File Management**:
- Grid view for image galleries (fabric colors, product photos)
- Drag-and-drop upload zones with progress indicators
- Image preview modals with metadata display

**Collaboration Features**:
- Comment systems for design ideas
- Status badges for development progress
- User avatars and timestamps for activity tracking

## Images Section
This application is **image-heavy** but functional:

**Required Images**:
- Fabric color swatches (small thumbnails in grid layout)
- Product photos (medium cards with hover zoom)
- Design concept uploads (flexible gallery format)
- User profile pictures (small circular avatars)

**No Hero Image**: This is a business tool, not a marketing site. Focus on immediate access to tools and data rather than promotional imagery.

**Image Optimization**: All uploaded images should display in consistent aspect ratios with proper loading states and fallback placeholders.
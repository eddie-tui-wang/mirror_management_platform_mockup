// ==================== Design System Tokens ====================
// All pages should reference these tokens instead of hardcoding values.

export const PAGE = {
  /** Page header: flex row with title + action buttons, marginBottom */
  headerMarginBottom: 16,
  /** Filter bar wrapper marginBottom */
  filterMarginBottom: 16,
} as const;

export const SELECT_WIDTH = {
  /** Status, small enums (Active/Disabled, All/Regular/Trial) */
  sm: 120,
  /** Type, Role, medium enums */
  md: 160,
  /** Org name, Customer name */
  lg: 200,
  /** Search / keyword input */
  search: 240,
} as const;

export const TABLE_IMAGE = {
  width: 60,
  height: 60,
  borderRadius: 4,
} as const;

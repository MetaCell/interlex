# FeatureNotAvailableDialog Component

A reusable React component for displaying a modal when users try to access features that are not yet implemented.

## Features

- **User-friendly messaging**: Shows a clear message about the unavailable feature
- **GitHub integration**: Provides a button to create a GitHub issue for feature requests
- **Customizable**: Allows custom titles and messages
- **Pre-filled issue template**: Automatically creates issue templates with relevant context

## Usage

```jsx
import FeatureNotAvailableDialog from '../common/FeatureNotAvailableDialog';

const MyComponent = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleFeatureClick = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Button onClick={handleFeatureClick}>
        Feature Not Available
      </Button>
      
      <FeatureNotAvailableDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title="Custom Feature Title" // Optional
        message="Custom message about the feature" // Optional
      />
    </>
  );
};
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `open` | boolean | - | Yes | Controls dialog visibility |
| `onClose` | function | - | Yes | Callback when dialog is closed |
| `title` | string | "Feature Not Yet Available" | No | Dialog title |
| `message` | string | "This feature is not yet implemented..." | No | Dialog message |

## GitHub Integration

When users click "Create GitHub Issue", the component:

1. Opens a new tab to the MetaCell/interlex GitHub repository
2. Pre-fills the issue title with the feature name
3. Creates a template with sections for:
   - Feature Description
   - Additional Context
   - Priority

## Current Usage

- **SingleTermView**: Used for unimplemented review and other features
- **Table View**: Used in search results and organization views when users try to access table view
- **CustomViewButton**: Integrated to show dialog instead of disabled button

## Implementation Notes

- Uses Material-UI components for consistent styling
- Opens GitHub links in new tabs with security attributes
- Provides clear call-to-action for user feedback
- Styled with a gray background box to draw attention to the feedback section
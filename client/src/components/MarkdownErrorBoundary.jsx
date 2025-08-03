import React from 'react';

class MarkdownErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.error('Markdown render error:', error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error rendering markdown:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <p className="text-sm text-red-500 italic">⚠️ Failed to render response.</p>;
    }

    return this.props.children;
  }
}

export default MarkdownErrorBoundary;
